import React from 'react';
import { Mail, ShieldCheck, Tag, Newspaper, Eye, Lock, Sparkles, Flame } from 'lucide-react';
import { DashboardStats } from '@shared/types';

interface StatCardsProps {
  stats: DashboardStats;
  onFilterSelect?: (category: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onFilterSelect }) => {
  return (
    <section aria-label="Inbox Intelligence Dashboard" style={{ marginBottom: '28px' }}>
      {/* 1. AI Insight & Privacy Banner */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderLeft: '4px solid var(--gold-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="var(--gold-light)" />
          <h3 style={{ fontSize: '1.05rem', color: '#fef3c7', fontWeight: 700 }}>
            Gemini AI Intelligence Insight
          </h3>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>
          {stats.aiInsight}
        </p>

        {/* Explicit Privacy Notice requirement */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '4px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          fontSize: '0.78rem',
          color: '#38bdf8'
        }}>
          <Lock size={14} />
          <span>
            <strong>Privacy Shield Active:</strong> Gemini AI analyzes ONLY subject lines, senders, and brief snippets. Full email bodies are NEVER accessed or transmitted.
          </span>
        </div>
      </div>

      {/* 2. Stat Counter Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Emails */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('all')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid var(--border-glass)',
            color: 'inherit'
          }}
          aria-label={`Total Emails: ${stats.totalEmails}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Mail</span>
            <Mail size={16} color="#94a3b8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{stats.totalEmails}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stats.unreadCount} unread</span>
        </button>

        {/* Protected Relics */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('protected')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(6, 78, 59, 0.25)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
            color: 'inherit'
          }}
          aria-label={`Protected Relics: ${stats.protectedCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>Protected Relics</span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a7f3d0' }}>{stats.protectedCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Inviolable 0 risk</span>
        </button>

        {/* Spam Candidates */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('spam')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'inherit'
          }}
          aria-label={`Spam Goblins: ${stats.spamCandidatesCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#fca5a5', textTransform: 'uppercase' }}>Spam Goblins</span>
            <span style={{ fontSize: '1.1rem' }}>👺</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{stats.spamCandidatesCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target for purge</span>
        </button>

        {/* Promotion Orcs */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('promotion')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            color: 'inherit'
          }}
          aria-label={`Promotion Orcs: ${stats.promotionsCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#fdba74', textTransform: 'uppercase' }}>Promotion Orcs</span>
            <Tag size={16} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c' }}>{stats.promotionsCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Flash sales & coupons</span>
        </button>

        {/* Newsletter Skeletons */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('newsletter')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: 'inherit'
          }}
          aria-label={`Newsletter Skeletons: ${stats.newslettersCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#d8b4fe', textTransform: 'uppercase' }}>Newsletters</span>
            <Newspaper size={16} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>{stats.newslettersCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Weekly digests</span>
        </button>

        {/* Important Conversations */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('important')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'inherit'
          }}
          aria-label={`Important Mail: ${stats.importantCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#7dd3fc', textTransform: 'uppercase' }}>Important</span>
            <Eye size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{stats.importantCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Priority threads</span>
        </button>

        {/* Urgent Alerts */}
        <button
          onClick={() => onFilterSelect && onFilterSelect('urgent')}
          className="glass-panel"
          style={{
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'inherit'
          }}
          aria-label={`Urgent Alerts: ${stats.urgentCount}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#fde68a', textTransform: 'uppercase' }}>Urgent</span>
            <Flame size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{stats.urgentCount}</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>High attention</span>
        </button>
      </div>
    </section>
  );
};
