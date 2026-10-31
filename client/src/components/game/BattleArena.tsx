import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Flame, Sparkles, Shield, Zap } from 'lucide-react';
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

  // Active enemy wave type
  const [activeEnemyType, setActiveEnemyType] = useState<EnemyType>('SPAM_GOBLIN');
  const enemyDef: EnemyDef = ENEMIES[activeEnemyType];

  // Combat stats & state
  const [currentHp, setCurrentHp] = useState<number>(enemyDef.baseHp);
  const [maxHp, setMaxHp] = useState<number>(enemyDef.baseHp);
  const [heroEnergy, setHeroEnergy] = useState<number>(100);
  const [isHit, setIsHit] = useState<boolean>(false);
  const [heroAttacking, setHeroAttacking] = useState<boolean>(false);
  const [activeFx, setActiveFx] = useState<'slash' | 'flame' | 'holy' | 'supernova' | null>(null);
  const [floatingDamage, setFloatingDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [combo, setCombo] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [recentUndoToken, setRecentUndoToken] = useState<string | null>(null);

  // Combat Log Feed
  const [battleLogs, setBattleLogs] = useState<string[]>([
    `⚔️ A wild ${enemyDef.name} encroaches upon your inbox! Prepare your spells.`,
    '🛡️ Gemini Protection Engine is actively warding all academic, career & banking records.'
  ]);

  // Target clutter emails
  const targetCategory = enemyDef.categoryTarget;
  const targetEmails = emails.filter(e => {
    const isMatchingCategory = e.classification?.category === targetCategory;
    const isUnarchived = !e.labels.includes('ARCHIVED');
    const isNotProtected = !e.classification?.isProtected;
    return isMatchingCategory && isUnarchived && isNotProtected;
  });

  // Switch enemy wave / dungeon floor
  const switchEnemy = (type: EnemyType) => {
    setActiveEnemyType(type);
    const def = ENEMIES[type];
    setCurrentHp(def.baseHp);
    setMaxHp(def.baseHp);
    setCombo(0);
    setBattleLogs(prev => [
      `⚡ Encounter shifted to Dungeon Floor: ${def.name}! Target category: ${def.categoryTarget}.`,
      ...prev.slice(0, 5)
    ]);
    announce(`A wild ${def.name} appears! Target category: ${def.categoryTarget}.`);
  };

  // Perform strike
  const performAttack = useCallback((dmg: number, attackName: string, fxType: 'slash' | 'flame' | 'holy' | 'supernova', energyCost = 0) => {
    if (showConfirmModal || isExecuting || currentHp === 0) return;

    if (energyCost > 0 && heroEnergy < energyCost) {
      announce(`Not enough energy for ${attackName}!`);
      return;
    }

    // Spend energy & trigger sound
    setHeroEnergy(prev => Math.max(0, prev - energyCost));
    sound.playSlash();

    // Trigger hero lunge animation
    setHeroAttacking(true);
    setTimeout(() => setHeroAttacking(false), 350);

    // Trigger spell effect & monster recoil
    setActiveFx(fxType);
    setIsHit(true);

    const isCrit = Math.random() > 0.65;
    const finalDmg = isCrit ? Math.round(dmg * 1.5) : dmg;
    setFloatingDamage({ amount: finalDmg, isCrit });
    setCombo(c => c + 1);

    setTimeout(() => {
      sound.playHit();
    }, 90);

    setTimeout(() => {
      setIsHit(false);
      setActiveFx(null);
      setFloatingDamage(null);
    }, 450);

    // Slowly recharge energy
    setHeroEnergy(prev => Math.min(100, prev + 5));

    setCurrentHp(prev => {
      const next = Math.max(0, prev - finalDmg);
      const critText = isCrit ? ' (CRITICAL STRIKE!)' : '';
      const logMessage = `💥 [Combat] Paladin casts ${attackName}! Deals ${finalDmg} damage${critText} to ${enemyDef.name}!`;

      setBattleLogs(logs => [logMessage, ...logs.slice(0, 6)]);
      announce(`${attackName} strikes for ${finalDmg} damage! ${enemyDef.name} HP: ${next}/${maxHp}`);

      if (next === 0) {
        sound.playDefeat();
        setShowConfirmModal(true);
        setBattleLogs(logs => [
          `🏆 [Victory!] ${enemyDef.name} collapsed! Preparing safe organization of ${Math.min(10, targetEmails.length)} emails!`,
          ...logs.slice(0, 6)
        ]);
      }
      return next;
    });
  }, [showConfirmModal, isExecuting, currentHp, heroEnergy, enemyDef.name, maxHp, targetEmails.length, announce]);

  // Keyboard navigation & hotkeys (1, 2, 3, 4, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1' || e.code === 'Digit1') {
        e.preventDefault();
        performAttack(12, 'Royal Slash', 'slash', 0);
      } else if (e.key === '2' || e.code === 'Digit2') {
        e.preventDefault();
        performAttack(18, 'Flame Ward', 'flame', 15);
      } else if (e.key === '3' || e.code === 'Digit3') {
        e.preventDefault();
        performAttack(25, 'Holy Smite', 'holy', 25);
      } else if (e.key === '4' || e.code === 'Digit4') {
        e.preventDefault();
        performAttack(45, 'Gemini Supernova', 'supernova', 40);
      } else if (e.code === 'Space') {
        e.preventDefault();
        performAttack(15, 'Quick Strike', 'slash', 0);
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
      setCurrentHp(enemyDef.baseHp);
      setHeroEnergy(100);
      setCombo(0);
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
      overflow: 'hidden',
      border: '2px solid rgba(245, 158, 11, 0.3)'
    }}>
      {/* 1. Dungeon Floor & Wave Selector Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
              Dungeon Arena
            </span>
            <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              Wave Encounter
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', fontWeight: 800, marginTop: '2px' }}>
            Battle for Inbox Zero Sanctity
          </h2>
        </div>

        {/* Monster Dungeon Floor Selection Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="tablist" aria-label="Enemy Dungeon Waves">
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
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  borderColor: isSelected ? def.color : undefined,
                  background: isSelected ? 'rgba(30, 41, 59, 0.95)' : undefined,
                  boxShadow: isSelected ? `0 0 14px ${def.color}60` : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                <span style={{ fontWeight: isSelected ? 800 : 500 }}>{def.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Authentic Video Game Combat Stage (Hero on Left vs Monster on Right) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 9, 19, 0.98) 100%)',
        border: '1px solid rgba(147, 197, 253, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Arena Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '20px',
          minHeight: '260px'
        }}>
          
          {/* HERO PALADIN (LEFT) */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div className={heroAttacking ? 'hero-lunge' : (calmMode ? '' : 'animate-float')}>
              <div style={{
                fontSize: '4.8rem',
                userSelect: 'none',
                filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.6))',
                display: 'inline-block'
              }}>
                🧙‍♂️
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--gold-light)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
                LVL 4 PALADIN
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800 }}>Paladin of Zero</h3>
              
              {/* Hero Energy Bar */}
              <div style={{ maxWidth: '200px', margin: '6px auto 0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#38bdf8', marginBottom: '3px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Zap size={13} /> Mana / Energy</span>
                  <span>{heroEnergy} / 100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)', overflow: 'hidden' }}>
                  <div style={{ width: `${heroEnergy}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* CLASH CENTER (VS BADGE, ACTIVE SPELL FX, COMBO) */}
          <div style={{ textAlign: 'center', position: 'relative', width: '120px' }}>
            {combo > 1 && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.8rem',
                padding: '3px 10px',
                borderRadius: '14px',
                boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)',
                whiteSpace: 'nowrap'
              }}>
                🔥 {combo}x COMBO!
              </div>
            )}

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '2px solid var(--gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: '#fbbf24',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}>
              VS
            </div>

            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
              Turn-Based
            </span>
          </div>

          {/* MONSTER FOE (RIGHT) */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            {/* Visual Spell Effects Over Monster */}
            {activeFx === 'slash' && <div className="fx-slash" style={{ fontSize: '4rem' }}>⚔️</div>}
            {activeFx === 'flame' && <div className="fx-flame" />}
            {activeFx === 'holy' && <div className="fx-holy" />}
            {activeFx === 'supernova' && <div className="fx-holy" style={{ filter: 'hue-rotate(90deg)' }} />}

            {/* Floating Damage Number */}
            {floatingDamage && (
              <div className="crit-pop" style={{
                fontSize: floatingDamage.isCrit ? '2.1rem' : '1.7rem',
                fontWeight: 900,
                color: floatingDamage.isCrit ? '#fbbf24' : '#ef4444',
                whiteSpace: 'nowrap'
              }}>
                -{floatingDamage.amount} {floatingDamage.isCrit ? '💥 CRIT!' : 'HP'}
              </div>
            )}

            {/* Monster Sprite */}
            <div
              className={isHit ? 'monster-recoil' : (calmMode ? '' : 'animate-float')}
              style={{
                fontSize: '4.8rem',
                userSelect: 'none',
                filter: `drop-shadow(0 0 25px ${enemyDef.color}80)`,
                display: 'inline-block',
                cursor: 'pointer'
              }}
              onClick={() => performAttack(15, 'Quick Strike', 'slash', 0)}
              title="Click monster to attack!"
            >
              {enemyDef.icon}
            </div>

            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.2)', border: `1px solid ${enemyDef.color}`, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, color: enemyDef.color, marginBottom: '4px' }}>
                TARGET CLUTTER
              </div>
              <h3 style={{ fontSize: '1.15rem', color: enemyDef.color, fontWeight: 800 }}>{enemyDef.name}</h3>

              {/* Monster HP Bar */}
              <div style={{ maxWidth: '200px', margin: '6px auto 0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>Health</span>
                  <span style={{ fontWeight: 700, color: enemyDef.color }}>{currentHp} / {maxHp} HP</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', overflow: 'hidden' }}>
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
          </div>

        </div>
      </div>

      {/* 3. Action Arsenal Deck & Special Ultimates */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Combat Action Deck (Press [1, 2, 3, 4, Space] or Click)
          </span>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
            ⚡ Energy: {heroEnergy}/100
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {/* Skill 1: Royal Slash */}
          <button
            onClick={() => performAttack(12, 'Royal Slash', 'slash', 0)}
            disabled={currentHp === 0}
            className="btn-primary"
            style={{ padding: '12px 10px', flexDirection: 'column', gap: '3px' }}
            aria-label="Attack 1: Royal Slash (Key 1 or Space)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sword size={16} />
              <span>Royal Slash</span>
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>[1 / Space] -12 HP (0 AP)</span>
          </button>

          {/* Skill 2: Flame Ward */}
          <button
            onClick={() => performAttack(18, 'Flame Ward', 'flame', 15)}
            disabled={currentHp === 0 || heroEnergy < 15}
            className="btn-primary"
            style={{
              padding: '12px 10px',
              flexDirection: 'column',
              gap: '3px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              opacity: heroEnergy < 15 ? 0.5 : 1
            }}
            aria-label="Attack 2: Flame Ward (Key 2)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={16} />
              <span>Flame Ward</span>
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>[Key 2] -18 HP (15 AP)</span>
          </button>

          {/* Skill 3: Holy Smite */}
          <button
            onClick={() => performAttack(25, 'Holy Smite', 'holy', 25)}
            disabled={currentHp === 0 || heroEnergy < 25}
            className="btn-primary"
            style={{
              padding: '12px 10px',
              flexDirection: 'column',
              gap: '3px',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
              opacity: heroEnergy < 25 ? 0.5 : 1
            }}
            aria-label="Attack 3: Holy Smite (Key 3)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={16} />
              <span>Holy Smite</span>
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>[Key 3] -25 HP (25 AP)</span>
          </button>

          {/* Skill 4: Gemini Supernova (Ultimate) */}
          <button
            onClick={() => performAttack(45, 'Gemini Supernova', 'supernova', 40)}
            disabled={currentHp === 0 || heroEnergy < 40}
            className="btn-primary"
            style={{
              padding: '12px 10px',
              flexDirection: 'column',
              gap: '3px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              opacity: heroEnergy < 40 ? 0.5 : 1
            }}
            aria-label="Attack 4: Gemini Supernova (Key 4)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={16} />
              <span>Supernova</span>
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>[Key 4] -45 HP (40 AP)</span>
          </button>
        </div>
      </div>

      {/* 4. Retro 8-Bit Scrolling Combat Terminal Feed */}
      <div style={{
        background: 'rgba(6, 9, 19, 0.9)',
        border: '1px solid rgba(147, 197, 253, 0.2)',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '16px',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(147, 197, 253, 0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>📜 Live Combat Terminal Feed</span>
          <span style={{ color: '#38bdf8' }}>Gemini 2.5 Flash Protected</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {battleLogs.slice(0, 3).map((log, index) => (
            <div key={index} style={{ color: index === 0 ? '#f8fafc' : '#64748b' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Real World Impact Preview */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        padding: '12px 16px',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#fbbf24" />
          <span style={{ color: '#cbd5e1' }}>
            Vanquishing this foe safely applies <code style={{ color: '#38bdf8' }}>{enemyDef.labelToApply}</code> & archives <strong>{Math.min(10, targetEmails.length)}</strong> clutter emails.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '0.78rem' }}>
          <span>🛡️ 0 Protected records touched</span>
          <span>•</span>
          <span>⏪ 100% Reversible Undo {recentUndoToken ? `(Token: ${recentUndoToken.slice(0, 6)}...)` : ''}</span>
        </div>
      </div>

      {/* Victory Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '28px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid var(--gold-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem'
              }}>
                🏆
              </div>
              <div>
                <h3 id="confirm-modal-title" style={{ fontSize: '1.3rem', color: '#fef3c7', fontWeight: 800 }}>
                  Victory! {enemyDef.name} Vanquished
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Execute Safe Batch Organization
                </p>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
              Your combat victory will trigger real, safe Gmail cleanup. All protected college notices, job offers, and banking records are guarded by the Protection Engine:
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
                <span style={{ color: '#94a3b8' }}>Action:</span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>Apply "{enemyDef.labelToApply}" & Archive</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Emails to Process:</span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{Math.min(10, targetEmails.length)} emails</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Protected Emails Touched:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>0 (Protected by Engine)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Permanent Deletion:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>Zero Destructive APIs</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setCurrentHp(enemyDef.baseHp);
                  setHeroEnergy(100);
                  setCombo(0);
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
                {isExecuting ? 'Executing...' : 'Purge Clutter & Gain +150 XP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
