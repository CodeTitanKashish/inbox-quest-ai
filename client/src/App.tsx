import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { SignInPage } from './components/auth/SignInPage';
import { KingdomMeter } from './components/dashboard/KingdomMeter';
import { StatCards } from './components/dashboard/StatCards';
import { BattleArena } from './components/game/BattleArena';
import { EmailInspector } from './components/email/EmailInspector';
import { UndoDrawer } from './components/undo/UndoDrawer';
import { RewardsModal } from './components/rewards/RewardsModal';
import { AriaAnnouncerProvider, useAnnounce } from './components/common/AriaAnnouncer';
import { ApiService, AuthStatusResponse } from './services/api';
import { ActionLogEntry, DashboardStats, EmailItem, EnemyType, GameState } from '@shared/types';
import { createInitialGameState } from '@shared/constants';

const AppContent: React.FC = () => {
  const { announce } = useAnnounce();

  // App & Auth State
  const [auth, setAuth] = useState<AuthStatusResponse>({ isAuthenticated: false, isDemo: true });
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());

  // Sign-in page state — shown to brand-new visitors who haven't chosen a mode
  const [showSignIn, setShowSignIn] = useState<boolean>(false);
  const [signInLoading, setSignInLoading] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Real-time sync state
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    unreadCount: 0,
    protectedCount: 0,
    spamCandidatesCount: 0,
    promotionsCount: 0,
    newslettersCount: 0,
    importantCount: 0,
    urgentCount: 0,
    aiInsight: 'Analyzing kingdom dispatches...'
  });

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [undoLogs, setUndoLogs] = useState<ActionLogEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUndoOpen, setIsUndoOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  // Load complete kingdom data
  const loadData = useCallback(async () => {
    try {
      const [authRes, gameRes, statsRes, emailsRes, undoRes] = await Promise.all([
        ApiService.getAuthStatus(),
        ApiService.getGameState(),
        ApiService.getDashboardStats(),
        ApiService.getEmails({ limit: 40, search: searchQuery }),
        ApiService.getUndoLogs()
      ]);

      setAuth(authRes);
      setGameState(gameRes.gameState);
      setStats(statsRes);
      setEmails(emailsRes.emails);
      setNextPageToken(emailsRes.nextPageToken);
      setUndoLogs(undoRes.logs);

      // Show sign-in page if user is brand-new — no real auth AND inbox is empty (not in demo)
      const hasMadeChoice = document.cookie.includes('inbox_quest_authenticated') ||
        document.cookie.includes('inbox_quest_demo');
      if (!hasMadeChoice && !authRes.isAuthenticated) {
        setShowSignIn(true);
      } else {
        setShowSignIn(false);
      }

      // Parse OAuth error from URL (after redirect back from Google)
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      if (errorParam) {
        setOauthError(decodeURIComponent(errorParam));
        setShowSignIn(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Google OAuth Login
  const handleLoginClick = async () => {
    try {
      setSignInLoading(true);
      setOauthError(null);
      const { url } = await ApiService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      setSignInLoading(false);
      const msg = err.message || 'OAuth unavailable';
      setOauthError(`Google Sign-In unavailable: ${msg}. You can try Demo Mode below.`);
    }
  };

  // Handle Demo Mode activation
  const handleDemoClick = async () => {
    try {
      setSignInLoading(true);
      setLoading(true);
      await ApiService.activateDemoMode();
      setShowSignIn(false);
      setOauthError(null);
      announce('Demo Mode activated with 200 realistic emails loaded.');
      await loadData();
      setDemoBanner('✨ 200 sample emails loaded into Demo Mode. Explore the Battle Arena and Royal Relics below!');
      setTimeout(() => setDemoBanner(null), 5000);
    } catch (err: any) {
      alert(`Failed to activate demo mode: ${err.message}`);
    } finally {
      setLoading(false);
      setSignInLoading(false);
    }
  };

  // Handle Logout — show sign-in page again
  const handleLogoutClick = async () => {
    await ApiService.logout();
    setShowSignIn(true);
    setOauthError(null);
    setIsRealtimeActive(false);
    await loadData();
    announce('Logged out successfully.');
  };

  // Handle Calm Mode toggle
  const handleToggleCalm = async () => {
    const res = await ApiService.toggleCalmMode();
    setGameState(res.gameState);
    announce(res.calmMode ? 'Calm Mode enabled.' : 'Calm Mode disabled.');
  };

  // Handle manual real-time sync trigger
  const handleTriggerSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const syncRes = await ApiService.triggerSync();
      setEmails(syncRes.emails);
      const [statsRes, undoRes] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getUndoLogs()
      ]);
      setStats(statsRes);
      setUndoLogs(undoRes.logs);
      announce(`Inbox synced. ${syncRes.totalCount} emails updated.`);
    } catch (err: any) {
      console.warn('Sync failed:', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Set up SSE real-time connection
  useEffect(() => {
    if (showSignIn) return;
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = ApiService.createEventSource();

      es.addEventListener('connected', () => {
        setIsRealtimeActive(true);
      });

      es.addEventListener('inbox_changed', () => {
        // Silently refresh emails list when Gmail signals a change
        ApiService.getEmails({ limit: 40, search: searchQuery }).then(res => {
          setEmails(res.emails);
          setNextPageToken(res.nextPageToken);
        }).catch(() => {});
      });

      es.addEventListener('action_executed', () => {
        // Refresh after any action (from another tab/session)
        ApiService.getEmails({ limit: 40, search: searchQuery }).then(res => {
          setEmails(res.emails);
        }).catch(() => {});
        ApiService.getUndoLogs().then(res => setUndoLogs(res.logs)).catch(() => {});
      });

      es.onerror = () => {
        setIsRealtimeActive(false);
        es?.close();
        // Reconnect after 5 s
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      setIsRealtimeActive(false);
    };
  }, [showSignIn, searchQuery]);

  // Handle Batch RPG action from BattleArena
  const handleExecuteBatchAction = async (emailIds: string[], labelName: string, enemyType: EnemyType) => {
    const res = await ApiService.executeBatchAction(emailIds, labelName, enemyType);
    setGameState(res.gameState);

    // Refresh email list, dashboard counters, and undo logs
    const [statsRes, emailsRes, undoRes] = await Promise.all([
      ApiService.getDashboardStats(),
      ApiService.getEmails({ limit: 40, search: searchQuery }),
      ApiService.getUndoLogs()
    ]);
    setStats(statsRes);
    setEmails(emailsRes.emails);
    setNextPageToken(emailsRes.nextPageToken);
    setUndoLogs(undoRes.logs);

    return res;
  };

  // Handle Undo execution
  const handleExecuteUndo = async (token: string) => {
    const res = await ApiService.executeUndo(token);
    setGameState(res.gameState);

    // Refresh email list, stats, and logs
    const [statsRes, emailsRes, undoRes] = await Promise.all([
      ApiService.getDashboardStats(),
      ApiService.getEmails({ limit: 40, search: searchQuery }),
      ApiService.getUndoLogs()
    ]);
    setStats(statsRes);
    setEmails(emailsRes.emails);
    setNextPageToken(emailsRes.nextPageToken);
    setUndoLogs(undoRes.logs);
  };

  // Handle Claiming Quest
  const handleClaimQuest = async (questId: string) => {
    const res = await ApiService.claimQuest(questId);
    setGameState(res.gameState);
  };

  // Pagination
  const handleNextPage = async () => {
    if (!nextPageToken) return;
    const res = await ApiService.getEmails({ limit: 40, pageToken: nextPageToken, search: searchQuery });
    setEmails(res.emails);
    setNextPageToken(res.nextPageToken);
  };

  const handlePrevPage = async () => {
    const res = await ApiService.getEmails({ limit: 40, search: searchQuery });
    setEmails(res.emails);
    setNextPageToken(res.nextPageToken);
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Sign-In Landing Page for new / unauthenticated users ── */}
      {showSignIn ? (
        <SignInPage
          isLoading={signInLoading}
          oauthError={oauthError}
          onLoginClick={handleLoginClick}
          onDemoClick={handleDemoClick}
        />
      ) : (
        <>
      {/* Top Navbar */}
      <Navbar
        isAuthenticated={auth.isAuthenticated}
        isDemo={auth.isDemo}
        email={auth.email}
        calmMode={gameState.calmMode}
        undoCount={undoLogs.length}
        isRealtimeActive={isRealtimeActive}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        onLoginClick={handleLoginClick}
        onDemoClick={handleDemoClick}
        onLogoutClick={handleLogoutClick}
        onToggleCalm={handleToggleCalm}
        onOpenUndo={() => setIsUndoOpen(true)}
        onOpenRewards={() => setIsRewardsOpen(true)}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {demoBanner && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <span>{demoBanner}</span>
            <button
              onClick={() => setDemoBanner(null)}
              style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontSize: '1.1rem' }}
              aria-label="Dismiss banner"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gold-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
            <h2 style={{ fontSize: '1.4rem' }}>Opening the Kingdom Gates...</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Deploying Gemini AI Intelligence and Protection Guards</p>
          </div>
        ) : (
          <>
            {/* 1. Hero Progression & Kingdom Safety Score */}
            <KingdomMeter
              gameState={gameState}
              onClaimQuest={handleClaimQuest}
            />

            {/* 2. Intelligence Dashboard & AI Insights Bar */}
            <StatCards
              stats={stats}
              onFilterSelect={(cat) => setActiveFilter(cat)}
            />

            {/* 3. Fantasy RPG Battle Arena */}
            <BattleArena
              emails={emails}
              calmMode={gameState.calmMode}
              onExecuteBatchAction={handleExecuteBatchAction}
            />

            {/* 4. Full Email Inspector with Sacred Relic Protection */}
            <EmailInspector
              emails={emails}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSearchChange={setSearchQuery}
              nextPageToken={nextPageToken}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </>
        )}
      </main>

      {/* Reversible Undo Drawer */}
      <UndoDrawer
        isOpen={isUndoOpen}
        onClose={() => setIsUndoOpen(false)}
        undoLogs={undoLogs}
        onExecuteUndo={handleExecuteUndo}
      />

      {/* Kingdom Armory & Rewards Modal */}
      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        level={gameState.hero.level}
        xp={gameState.hero.xp}
        relicsGuarded={gameState.relicsGuarded}
        clutterDefeated={gameState.clutterDefeated}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid var(--border-glass)',
        color: '#64748b',
        fontSize: '0.8rem'
      }}>
        <p>
          Inbox Quest AI • Built with React, Node.js, Google Gemini API, Gmail API & Google Cloud Run.
        </p>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Backend Protection Engine strictly enforces zero email deletion and HTTP 403 on protected records.
        </p>
      </footer>
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AriaAnnouncerProvider>
      <AppContent />
    </AriaAnnouncerProvider>
  );
};

export default App;
