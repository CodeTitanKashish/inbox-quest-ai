import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
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
      const { url } = await ApiService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      alert(`Google OAuth login unavailable: ${err.message}. You can test the complete app in Demo Mode!`);
    }
  };

  // Handle Demo Mode activation
  const handleDemoClick = async () => {
    try {
      setLoading(true);
      await ApiService.activateDemoMode();
      announce('Demo Mode activated with 200 realistic emails loaded.');
      await loadData();
      setDemoBanner('✨ 200 sample emails loaded into Demo Mode. Explore the Battle Arena and Royal Relics below!');
      setTimeout(() => setDemoBanner(null), 5000);
    } catch (err: any) {
      alert(`Failed to activate demo mode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogoutClick = async () => {
    await ApiService.logout();
    await loadData();
    announce('Logged out. Switched back to Demo Mode.');
  };

  // Handle Calm Mode toggle
  const handleToggleCalm = async () => {
    const res = await ApiService.toggleCalmMode();
    setGameState(res.gameState);
    announce(res.calmMode ? 'Calm Mode enabled.' : 'Calm Mode disabled.');
  };

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
      {/* Top Navbar */}
      <Navbar
        isAuthenticated={auth.isAuthenticated}
        isDemo={auth.isDemo}
        email={auth.email}
        calmMode={gameState.calmMode}
        undoCount={undoLogs.length}
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
