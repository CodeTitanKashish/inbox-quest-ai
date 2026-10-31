import React from 'react';
import { Award, Sparkles, Zap, Scroll, Gem, Shield } from 'lucide-react';
import { GameState } from '@shared/types';
import { sound } from '../../audio/synth';
import { useAnnounce } from '../common/AriaAnnouncer';

interface KingdomMeterProps {
  gameState: GameState;
  onClaimQuest: (questId: string) => void;
}

export const KingdomMeter: React.FC<KingdomMeterProps> = ({ gameState, onClaimQuest }) => {
  const { hero, kingdomSafetyScore, activeQuest, relicsGuarded, clutterDefeated } = gameState;
  const { announce } = useAnnounce();

  const handleClaim = () => {
    if (activeQuest && activeQuest.isCompleted && !activeQuest.rewardClaimed) {
      sound.playLevelUp();
      announce(`Quest completed! Claimed ${activeQuest.rewardXp} experience points!`);
      onClaimQuest(activeQuest.id);
    }
  };

  const getSafetyTier = (score: number) => {
    if (score >= 90) return { label: 'Citadel Fortified', color: '#10b981', desc: 'Protected emails are impervious.' };
    if (score >= 70) return { label: 'Vigilant Kingdom', color: '#38bdf8', desc: 'Defenses hold strong against clutter.' };
    if (score >= 50) return { label: 'Contested Borders', color: '#f59e0b', desc: 'Digital monsters are encroaching.' };
    return { label: 'Citadel Besieged', color: '#ef4444', desc: 'Inbox clutter threatening peace.' };
  };

  const tier = getSafetyTier(kingdomSafetyScore);

  return (
    <section aria-label="Hero and Kingdom Progression" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    }}>
      {/* 1. Hero Paladin Card */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              {hero.title}
            </span>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 700 }}>{hero.name}</h2>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Award size={20} color="var(--gold-light)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fef3c7' }}>LVL {hero.level}</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>
            <span>Experience (XP)</span>
            <span>{hero.xp} / {hero.xp + hero.xpToNextLevel} XP ({hero.xpToNextLevel} to next)</span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{
              width: `${Math.min(100, Math.round((hero.xp % 100))) || 5}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
              borderRadius: '6px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Zap size={14} />
              <span>Energy</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{hero.energy} / {hero.maxEnergy}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Scroll size={14} />
              <span>Relics Guarded</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{relicsGuarded}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Gem size={14} />
              <span>Clutter Slain</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{clutterDefeated}</div>
          </div>
        </div>
      </div>

      {/* 2. Kingdom Safety Meter */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: tier.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Realm Integrity
            </span>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 700 }}>Kingdom Safety Meter</h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '6px 12px',
            borderRadius: '10px',
            border: `1px solid ${tier.color}`
          }}>
            <Shield size={20} color={tier.color} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: tier.color }}>{kingdomSafetyScore}%</span>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            width: '100%',
            height: '14px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-glass)',
            position: 'relative'
          }}>
            <div style={{
              width: `${kingdomSafetyScore}%`,
              height: '100%',
              background: `linear-gradient(90deg, #f59e0b 0%, ${tier.color} 100%)`,
              boxShadow: `0 0 15px ${tier.color}`,
              borderRadius: '8px',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px' }}>
          <strong style={{ color: tier.color }}>{tier.label}:</strong> {tier.desc} Protected university notices, job offers, and financial alerts remain untouched and guarded by the Royal Guard.
        </p>

        {/* Active Quest Preview */}
        {activeQuest && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--gold-light)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{activeQuest.title}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Progress: {activeQuest.currentCount} / {activeQuest.targetCount} ({activeQuest.rewardXp} XP reward)
              </p>
            </div>
            {activeQuest.isCompleted && !activeQuest.rewardClaimed ? (
              <button
                onClick={handleClaim}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Claim XP
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: activeQuest.rewardClaimed ? '#10b981' : '#94a3b8' }}>
                {activeQuest.rewardClaimed ? 'Claimed ✓' : 'In Progress'}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
