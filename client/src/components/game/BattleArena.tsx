import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Flame, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { EmailItem, EnemyDef, EnemyType } from '@shared/types';
import { ENEMIES } from '@shared/constants';
import { sound } from '../../audio/synth';
import { useAnnounce } from '../common/AriaAnnouncer';

interface BattleArenaProps {
  emails: EmailItem[];
  calmMode: boolean;
  onExecuteBatchAction: (emailIds: string[], labelName: string, enemyType: EnemyType) => Promise<any>;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  emails,
  calmMode,
  onExecuteBatchAction
}) => {
  const { announce } = useAnnounce();

  // Pick active enemy wave type
  const [activeEnemyType, setActiveEnemyType] = useState<EnemyType>('SPAM_GOBLIN');
  const enemyDef: EnemyDef = ENEMIES[activeEnemyType];

  // Monster combat state
  const [currentHp, setCurrentHp] = useState<number>(enemyDef.baseHp);
  const [maxHp, setMaxHp] = useState<number>(enemyDef.baseHp);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [floatingDamage, setFloatingDamage] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [recentUndoToken, setRecentUndoToken] = useState<string | null>(null);

  // Filter matching clutter emails targetable by this enemy
  const targetCategory = enemyDef.categoryTarget;
  const targetEmails = emails.filter(e => {
    const isMatchingCategory = e.classification?.category === targetCategory;
    const isUnarchived = !e.labels.includes('ARCHIVED');
    const isNotProtected = !e.classification?.isProtected;
    return isMatchingCategory && isUnarchived && isNotProtected;
  });

  // Switch enemy wave
  const switchEnemy = (type: EnemyType) => {
    setActiveEnemyType(type);
    const def = ENEMIES[type];
    setCurrentHp(def.baseHp);
    setMaxHp(def.baseHp);
    announce(`A wild ${def.name} appears! Target category: ${def.categoryTarget}.`);
  };

  // Perform strike
  const performAttack = useCallback((dmg: number, attackName: string) => {
    if (showConfirmModal || isExecuting) return;

    sound.playSlash();
    setIsHit(true);
    setFloatingDamage(dmg);

    setTimeout(() => {
      sound.playHit();
    }, 80);

    setTimeout(() => {
      setIsHit(false);
      setFloatingDamage(null);
    }, 400);

    setCurrentHp(prev => {
      const next = Math.max(0, prev - dmg);
      announce(`${attackName} strikes for ${dmg} damage! ${enemyDef.name} HP: ${next}/${maxHp}`);

      if (next === 0) {
        sound.playDefeat();
        setShowConfirmModal(true);
      }
      return next;
    });
  }, [showConfirmModal, isExecuting, enemyDef.name, maxHp, announce]);

  // Keyboard navigation & hotkeys (1, 2, 3, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture hotkeys if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1' || e.code === 'Digit1') {
        e.preventDefault();
        performAttack(12, 'Royal Slash');
      } else if (e.key === '2' || e.code === 'Digit2') {
        e.preventDefault();
        performAttack(18, 'Flame Ward');
      } else if (e.key === '3' || e.code === 'Digit3') {
        e.preventDefault();
        performAttack(25, 'Holy Smite');
      } else if (e.code === 'Space') {
        e.preventDefault();
        performAttack(15, 'Quick Attack');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performAttack]);

  // Handle batch action confirmation
  const handleConfirmBatch = async () => {
    setIsExecuting(true);
    const emailIdsToClean = targetEmails.slice(0, 10).map(e => e.id);

    try {
      const res = await onExecuteBatchAction(emailIdsToClean, enemyDef.labelToApply, activeEnemyType);
      announce(`Victory! Banished ${enemyDef.name}. ${res.modifiedCount} emails safely organized under ${enemyDef.labelToApply}.`);
      setRecentUndoToken(res.undoToken);
      setShowConfirmModal(false);

      // Reset HP for next wave
      setCurrentHp(enemyDef.baseHp);
    } catch (err: any) {
      alert(`Action could not proceed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section aria-label="Fantasy RPG Battle Arena" className="glass-panel" style={{
      padding: '24px',
      marginBottom: '28px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Wave Selector Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '14px'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Combat Arena
          </span>
          <h2 style={{ fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>
            Battle for Inbox Sanctity
          </h2>
        </div>

        {/* Monster Wave Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="tablist" aria-label="Enemy Factions">
          {(Object.keys(ENEMIES) as EnemyType[]).map(type => {
            const def = ENEMIES[type];
            const isSelected = activeEnemyType === type;
            return (
              <button
                key={type}
                role="tab"
                aria-selected={isSelected}
                onClick={() => switchEnemy(type)}
                className="btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  borderColor: isSelected ? def.color : undefined,
                  background: isSelected ? 'rgba(30, 41, 59, 0.9)' : undefined,
                  boxShadow: isSelected ? `0 0 10px ${def.color}40` : undefined
                }}
              >
                <span>{def.icon}</span>
                <span>{def.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arena Stage */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Monster Display & HP */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)',
          position: 'relative'
        }}>
          {/* Monster Sprite */}
          <div
            className={isHit ? 'animate-hit' : (calmMode ? '' : 'animate-float')}
            style={{
              fontSize: '4.5rem',
              marginBottom: '10px',
              userSelect: 'none',
              filter: `drop-shadow(0 0 18px ${enemyDef.color}80)`
            }}
          >
            {enemyDef.icon}
          </div>

          {/* Floating Damage Number */}
          {floatingDamage && (
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#fbbf24',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.9)',
              pointerEvents: 'none'
            }}>
              -{floatingDamage} HP
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', color: enemyDef.color, fontWeight: 700, marginBottom: '4px' }}>
            {enemyDef.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px', maxWidth: '320px', margin: '0 auto 14px auto' }}>
            {enemyDef.description}
          </p>

          {/* Monster Health Bar */}
          <div style={{ maxWidth: '280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
              <span>Enemy Health</span>
              <span>{currentHp} / {maxHp} HP</span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{
                width: `${Math.round((currentHp / maxHp) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, #ef4444 0%, ${enemyDef.color} 100%)`,
                boxShadow: `0 0 10px ${enemyDef.color}`,
                transition: 'width 0.25s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Combat Actions & Clutter Preview */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Combat Arsenal (Keyboard / Mouse)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => performAttack(12, 'Royal Slash')}
                disabled={currentHp === 0}
                className="btn-primary"
                style={{ padding: '12px 10px', flexDirection: 'column', gap: '4px' }}
                aria-label="Attack 1: Royal Slash (Key 1 or Space)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sword size={16} />
                  <span>Royal Slash</span>
                </div>
                <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>[Key 1 / Space] -12 HP</span>
              </button>

              <button
                onClick={() => performAttack(18, 'Flame Ward')}
                disabled={currentHp === 0}
                className="btn-primary"
                style={{
                  padding: '12px 10px',
                  flexDirection: 'column',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                }}
                aria-label="Attack 2: Flame Ward (Key 2)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={16} />
                  <span>Flame Ward</span>
                </div>
                <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>[Key 2] -18 HP</span>
              </button>

              <button
                onClick={() => performAttack(25, 'Holy Smite')}
                disabled={currentHp === 0}
                className="btn-primary"
                style={{
                  padding: '12px 10px',
                  flexDirection: 'column',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'
                }}
                aria-label="Attack 3: Holy Smite (Key 3)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={16} />
                  <span>Holy Smite</span>
                </div>
                <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>[Key 3] -25 HP</span>
              </button>
            </div>
          </div>

          {/* Real World Impact Preview */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            padding: '14px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
              <Shield size={16} />
              <span>Real World Gmail Impact</span>
            </div>
            <p style={{ color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
              Defeating this foe will organize up to <strong>{targetEmails.length}</strong> {enemyDef.categoryTarget.toLowerCase()} emails under the label <code style={{ color: '#38bdf8' }}>{enemyDef.labelToApply}</code> and safely archive them.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.78rem' }}>
              <span>✓ 0 Protected emails affected</span>
              <span>•</span>
              <span>✓ Reversible with 1-click Undo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before real Gmail batch execution */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid var(--gold-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={24} color="var(--gold-light)" />
              </div>
              <h3 id="confirm-modal-title" style={{ fontSize: '1.25rem', color: '#fef3c7' }}>
                Confirm Kingdom Action
              </h3>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px' }}>
              You have vanquished the <strong>{enemyDef.name}</strong>! This victory will execute the following safe Gmail organization:
            </p>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid var(--border-glass)',
              marginBottom: '20px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Target Action:</span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>Apply "{enemyDef.labelToApply}" & Archive</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Emails to Process:</span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{Math.min(10, targetEmails.length)} emails</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Protected Emails Touched:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>0 (Protected by Engine)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setCurrentHp(enemyDef.baseHp);
                }}
                disabled={isExecuting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatch}
                disabled={isExecuting}
                className="btn-primary"
              >
                {isExecuting ? 'Organizing Realm...' : 'Confirm & Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Notification Toast */}
      {recentUndoToken && (
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a7f3d0' }}>
            <span>✓ Batch action complete. Your inbox was cleanly organized.</span>
          </div>
          <button
            onClick={() => setRecentUndoToken(null)}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
};
