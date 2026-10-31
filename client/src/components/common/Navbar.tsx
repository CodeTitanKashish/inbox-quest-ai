import React from 'react';
import { Shield, Sparkles, Volume2, VolumeX, Moon, RotateCcw, LogIn, LogOut, Trophy, RefreshCw } from 'lucide-react';
import { sound } from '../../audio/synth';
import { useAnnounce } from './AriaAnnouncer';

interface NavbarProps {
  isAuthenticated: boolean;
  isDemo: boolean;
  email?: string;
  calmMode: boolean;
  undoCount: number;
  isRealtimeActive?: boolean;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
  onLoginClick: () => void;
  onDemoClick: () => void;
  onLogoutClick: () => void;
  onToggleCalm: () => void;
  onOpenUndo: () => void;
  onOpenRewards: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  isDemo,
  email,
  calmMode,
  undoCount,
  isRealtimeActive = true,
  isSyncing = false,
  onTriggerSync,
  onLoginClick,
  onDemoClick,
  onLogoutClick,
  onToggleCalm,
  onOpenUndo,
  onOpenRewards
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());
  const { announce } = useAnnounce();

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    announce(isNowMuted ? 'Sound muted' : 'Sound unmuted');
  };

  return (
    <header className="navbar-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(6, 9, 19, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
        }}>
          <Shield size={24} color="#0f172a" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 900 }}>INBOX QUEST AI</h1>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 8px',
              borderRadius: '20px',
              background: isDemo ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isDemo ? '#38bdf8' : '#10b981',
              border: `1px solid ${isDemo ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isDemo ? 'Demo Mode (200 Emails)' : 'Gmail Connected'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Gemini-Powered Fantasy RPG for Email Clutter
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Real-time Gmail Sync Status & Trigger */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="btn-secondary"
          title={isRealtimeActive ? "Real-time Gmail changes active. Click to sync immediately." : "Connecting to real-time Gmail changes. Click to sync."}
          aria-label={isSyncing ? "Syncing Gmail inbox..." : "Sync Gmail Inbox in Real-Time"}
          style={{
            padding: '8px 14px',
            fontSize: '0.85rem',
            background: isRealtimeActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.1)',
            borderColor: isRealtimeActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.3)',
            color: isRealtimeActive ? '#34d399' : '#38bdf8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            className={isRealtimeActive ? 'pulse-live-dot' : ''}
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isRealtimeActive ? '#10b981' : '#f59e0b',
              boxShadow: isRealtimeActive ? '0 0 8px #10b981' : 'none'
            }}
          />
          <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Real-Time Sync'}</span>
        </button>

        {/* Calm Mode Toggle (Accessibility) */}
        <button
          onClick={onToggleCalm}
          className="btn-secondary"
          title="Toggle Calm Mode: non-timed, reduced-motion gameplay"
          aria-label={calmMode ? 'Disable Calm Mode' : 'Enable Calm Mode'}
          style={{
            padding: '8px 14px',
            fontSize: '0.85rem',
            background: calmMode ? 'rgba(168, 85, 247, 0.25)' : undefined,
            borderColor: calmMode ? 'var(--mystic-purple)' : undefined
          }}
        >
          <Moon size={16} color={calmMode ? '#c084fc' : '#94a3b8'} />
          <span>{calmMode ? 'Calm Mode ON' : 'Calm Mode'}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleSound}
          className="btn-secondary"
          title={muted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
          aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
          style={{ padding: '8px 12px' }}
        >
          {muted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#38bdf8" />}
        </button>

        {/* Undo History Drawer */}
        <button
          onClick={onOpenUndo}
          className="btn-secondary"
          title="Reversible Actions & Undo Drawer"
          aria-label={`Open Undo Drawer. ${undoCount} actions undoable`}
          style={{ padding: '8px 14px', position: 'relative' }}
        >
          <RotateCcw size={16} color="#fbbf24" />
          <span>Undo</span>
          {undoCount > 0 && (
            <span style={{
              background: 'var(--gold-primary)',
              color: '#0f172a',
              borderRadius: '12px',
              padding: '1px 6px',
              fontSize: '0.7rem',
              fontWeight: 800,
              marginLeft: '4px'
            }}>
              {undoCount}
            </span>
          )}
        </button>

        {/* Rewards & Armory Drawer */}
        <button
          onClick={onOpenRewards}
          className="btn-secondary"
          title="Kingdom Armory, Badges & Daily Loot Chests"
          aria-label="Open Kingdom Rewards"
          style={{ padding: '8px 14px', position: 'relative', borderColor: 'rgba(245, 158, 11, 0.4)' }}
        >
          <Trophy size={16} color="#fbbf24" />
          <span>Rewards</span>
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#0f172a',
            borderRadius: '12px',
            padding: '1px 6px',
            fontSize: '0.65rem',
            fontWeight: 800,
            marginLeft: '4px'
          }}>
            NEW
          </span>
        </button>

        {/* Try Demo Button - Always visible and accessible */}
        <button
          onClick={onDemoClick}
          className="btn-secondary"
          id="try-demo-btn"
          title="Load 200 realistic sample emails into Demo Mode"
          aria-label="Try Demo Mode with 200 sample emails"
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            background: isDemo ? 'rgba(56, 189, 248, 0.18)' : 'rgba(245, 158, 11, 0.18)',
            borderColor: isDemo ? 'rgba(56, 189, 248, 0.5)' : 'rgba(245, 158, 11, 0.5)',
            color: isDemo ? '#38bdf8' : '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} color={isDemo ? '#38bdf8' : '#fbbf24'} />
          <span style={{ fontWeight: 700 }}>Try Demo</span>
        </button>

        {/* Auth / Login Controls */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{email}</span>
            <button
              onClick={onLogoutClick}
              className="btn-secondary"
              title="Logout from Gmail"
              style={{ padding: '8px 12px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <LogIn size={16} />
            <span>Login with Google</span>
          </button>
        )}
      </div>
    </header>
  );
};
