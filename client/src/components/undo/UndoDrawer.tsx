import React from 'react';
import { RotateCcw, X, Clock, CheckCircle } from 'lucide-react';
import { ActionLogEntry } from '@shared/types';
import { sound } from '../../audio/synth';
import { useAnnounce } from '../common/AriaAnnouncer';

interface UndoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  undoLogs: ActionLogEntry[];
  onExecuteUndo: (token: string) => Promise<void>;
}

export const UndoDrawer: React.FC<UndoDrawerProps> = ({
  isOpen,
  onClose,
  undoLogs,
  onExecuteUndo
}) => {
  const { announce } = useAnnounce();
  const [loadingToken, setLoadingToken] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleUndo = async (token: string) => {
    setLoadingToken(token);
    try {
      sound.playUndo();
      await onExecuteUndo(token);
      announce('Action undone successfully. Emails restored to their previous states.');
    } catch (err: any) {
      alert(`Undo failed: ${err.message}`);
    } finally {
      setLoadingToken(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 120
    }} role="dialog" aria-modal="true" aria-labelledby="undo-drawer-title">
      <div style={{
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        background: 'rgba(15, 23, 42, 0.98)',
        borderLeft: '1px solid var(--border-glass)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={20} color="var(--gold-primary)" />
            <h3 id="undo-drawer-title" style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
              Chronos Time Chamber (Undo)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px' }}
            aria-label="Close Undo Drawer"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '18px', lineHeight: 1.4 }}>
          Every quest action taken against digital monsters is logged. You can reverse any action at any time to restore emails to their exact previous labels and inbox state.
        </p>

        {/* Undo Entries List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {undoLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              No actions available to undo. Your realm is in harmony!
            </div>
          ) : (
            undoLogs.map(log => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                      Organized & Archived
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <Clock size={12} />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Label applied: <code style={{ color: '#38bdf8' }}>{log.labelName}</code> ({log.affectedEmailIds.length} emails)
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    onClick={() => handleUndo(log.id)}
                    disabled={loadingToken === log.id}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    {loadingToken === log.id ? 'Reversing...' : 'Revert / Undo Action'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
