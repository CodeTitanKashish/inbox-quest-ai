import React, { useState } from 'react';
import { ShieldCheck, Search, Sparkles, Filter, Lock, Tag, Zap, Check } from 'lucide-react';
import { EmailItem, EnemyType } from '@shared/types';
import { sound } from '../../audio/synth';
import { useAnnounce } from '../common/AriaAnnouncer';

interface EmailInspectorProps {
  emails: EmailItem[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onExecuteSingleAction?: (emailId: string, labelName: string, enemyType?: EnemyType) => Promise<any>;
  nextPageToken?: string;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const EmailInspector: React.FC<EmailInspectorProps> = ({
  emails,
  activeFilter,
  onFilterChange,
  onSearchChange,
  onExecuteSingleAction,
  nextPageToken,
  onNextPage,
  onPrevPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isExecutingSingle, setIsExecutingSingle] = useState(false);
  const { announce } = useAnnounce();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchTerm);
  };

  const handleRelicClick = (email: EmailItem) => {
    sound.playRelicChime();
    announce(`Royal Ward Protected: ${email.subject}. This email cannot be archived or removed.`);
    setSelectedEmail(email);
  };

  const getEnemyAndLabel = (category?: string): { labelName: string; enemyType: EnemyType } => {
    switch (category) {
      case 'Spam': return { labelName: 'InboxQuest/Spam', enemyType: 'SPAM_GOBLIN' };
      case 'Promotion': return { labelName: 'InboxQuest/Promotions', enemyType: 'PROMOTION_ORC' };
      case 'Newsletter': return { labelName: 'InboxQuest/Newsletters', enemyType: 'NEWSLETTER_SKELETON' };
      case 'Social': return { labelName: 'InboxQuest/Social', enemyType: 'NOTIFICATION_ZOMBIE' };
      default: return { labelName: 'InboxQuest/Archive', enemyType: 'DUPLICATE_SLIME' };
    }
  };

  const handleExecuteRealtimeAction = async (email: EmailItem) => {
    if (!onExecuteSingleAction || email.classification?.isProtected) return;
    const { labelName, enemyType } = getEnemyAndLabel(email.classification?.category);
    setIsExecutingSingle(true);
    try {
      sound.playSlash();
      await onExecuteSingleAction(email.id, labelName, enemyType);
      sound.playHit();
      announce(`Real-time change applied to Gmail: Email archived and labeled under ${labelName}.`);
      setSelectedEmail(null);
    } catch (err: any) {
      alert(`Could not execute action: ${err.message}`);
    } finally {
      setIsExecutingSingle(false);
    }
  };

  // Filter emails based on tab selection
  const filteredEmails = emails.filter(email => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'protected') return email.classification?.isProtected;
    if (activeFilter === 'spam') return email.classification?.category === 'Spam';
    if (activeFilter === 'promotion') return email.classification?.category === 'Promotion';
    if (activeFilter === 'newsletter') return email.classification?.category === 'Newsletter';
    if (activeFilter === 'important') {
      return (
        email.classification?.category === 'Important' ||
        email.classification?.category === 'Critical' ||
        (email.classification?.importanceScore ?? 0) >= 70
      );
    }
    return true;
  });

  return (
    <section aria-label="Kingdom Mail Archive" className="glass-panel" style={{ padding: '24px' }}>
      {/* Header and Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--royal-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Intelligence Viewer
          </span>
          <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
            Royal Archive & Email Classification
          </h2>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search subject, sender..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '220px'
              }}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            Filter
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '12px'
      }} role="tablist" aria-label="Email Category Filters">
        {[
          { id: 'all', label: 'All Mail', icon: <Filter size={14} /> },
          { id: 'protected', label: '🛡️ Protected Relics', icon: <Lock size={14} color="#10b981" /> },
          { id: 'spam', label: '👺 Spam Goblins', icon: null },
          { id: 'promotion', label: '👹 Promotion Orcs', icon: null },
          { id: 'newsletter', label: '💀 Newsletters', icon: null },
          { id: 'important', label: '💎 Critical & Important', icon: null }
        ].map(tab => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onFilterChange(tab.id)}
              className="btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                background: isSelected ? 'rgba(56, 189, 248, 0.2)' : undefined,
                borderColor: isSelected ? 'var(--royal-blue)' : undefined,
                color: isSelected ? '#38bdf8' : undefined
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Email List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {filteredEmails.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
            No emails found in this category. All clear!
          </div>
        ) : (
          filteredEmails.map(email => {
            const isProtected = email.classification?.isProtected;
            const cat = email.classification?.category || 'General';

            return (
              <div
                key={email.id}
                onClick={() => isProtected ? handleRelicClick(email) : setSelectedEmail(email)}
                style={{
                  background: isProtected
                    ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(15, 23, 42, 0.75) 100%)'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isProtected
                    ? '1px solid rgba(16, 185, 129, 0.45)'
                    : '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isProtected ? '0 0 12px rgba(16, 185, 129, 0.1)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isProtected ? (
                      <span
                        title="Protected Royal Relic (Inviolable)"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}
                      >
                        <ShieldCheck size={12} />
                        <span>PROTECTED RELIC</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          background: 'rgba(147, 197, 253, 0.1)',
                          color: '#93c5fd',
                          border: '1px solid rgba(147, 197, 253, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      >
                        {cat}
                      </span>
                    )}

                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      {email.sender.split('<')[0].trim()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {email.classification && (
                      <span style={{ color: email.classification.importanceScore >= 70 ? '#fbbf24' : '#94a3b8' }}>
                        Importance: {email.classification.importanceScore}/100
                      </span>
                    )}
                    <span>{new Date(email.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                  {email.subject}
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '8px' }}>
                  {email.snippet}
                </p>

                {/* AI Summary and Recommended Action */}
                {email.classification && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '8px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                      <Sparkles size={13} color="var(--gold-light)" />
                      <span><strong>AI Summary:</strong> {email.classification.summary}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isProtected ? (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>
                          Rule: Never Archive (Protected)
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                          Action: {email.classification.recommendedAction}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={onPrevPage}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={!nextPageToken}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          Next Page
        </button>
      </div>

      {/* Email Detail / Protection Modal */}
      {selectedEmail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }} role="dialog" aria-modal="true">
          <div className="glass-panel" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: selectedEmail.classification?.isProtected ? '2px solid #10b981' : '1px solid var(--border-glass)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedEmail.classification?.isProtected ? (
                  <ShieldCheck size={22} color="#10b981" />
                ) : (
                  <Tag size={20} color="#38bdf8" />
                )}
                <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>
                  {selectedEmail.classification?.isProtected ? 'Royal Protected Scroll' : 'Email Intel'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>From:</div>
              <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>{selectedEmail.sender}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Subject:</div>
              <div style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>{selectedEmail.subject}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Snippet Preview:</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(30, 41, 59, 0.4)', padding: '10px', borderRadius: '8px' }}>
                {selectedEmail.snippet}
              </p>
            </div>

            {selectedEmail.classification?.isProtected && (
              <div style={{
                background: 'rgba(6, 78, 59, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '6px' }}>
                  🛡️ Inviolable Protection Reasons:
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                  {selectedEmail.classification.protectionReasons.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <p style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '8px' }}>
                  This email is protected on the server API layer. Any action to archive, trash, or delete this email is rejected with HTTP 403 Forbidden.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedEmail(null)}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
