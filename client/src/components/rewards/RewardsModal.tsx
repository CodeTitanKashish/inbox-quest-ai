import React, { useState } from 'react';
import { Trophy, Gift, X, CheckCircle2, Lock } from 'lucide-react';
import { sound } from '../../audio/synth';
import { useAnnounce } from '../common/AriaAnnouncer';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  xp: number;
  relicsGuarded: number;
  clutterDefeated: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: string;
  unlocked: boolean;
  progress: string;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  level,
  xp,
  relicsGuarded,
  clutterDefeated
}) => {
  const { announce } = useAnnounce();
  const [chestOpened, setChestOpened] = useState(false);
  const [chestLoot, setChestLoot] = useState<string | null>(null);

  if (!isOpen) return null;

  const achievements: Achievement[] = [
    {
      id: 'crown-guardian',
      title: 'Shield of the Realm',
      description: 'Preserve at least 15 sacred academic, job, and banking relics.',
      icon: '🛡️',
      reward: '+300 XP & "Citadel Paladin" Title',
      unlocked: relicsGuarded >= 15,
      progress: `${relicsGuarded} / 15 Guarded`
    },
    {
      id: 'goblin-bane',
      title: 'Goblin Slayer',
      description: 'Purge 5 Spam Goblins and clean phishing scams from your realm.',
      icon: '⚔️',
      reward: '+150 XP & Flame Ward Sword Skin',
      unlocked: clutterDefeated >= 5,
      progress: `${Math.min(clutterDefeated, 5)} / 5 Slayed`
    },
    {
      id: 'streak-crusader',
      title: 'Vigilant Streak Crusader',
      description: 'Perform triage sweeps 3 days in a row to maintain inbox zero.',
      icon: '🔥',
      reward: '+25% Permanent XP Boost',
      unlocked: true,
      progress: '3-Day Streak Active'
    },
    {
      id: 'scholar-aegis',
      title: "Scholar's Aegis",
      description: 'Safeguard all university semester notices and exam hall tickets.',
      icon: '📜',
      reward: '+200 XP & Royal Scribe Sigil',
      unlocked: true,
      progress: '100% Academic Safety'
    },
    {
      id: 'inbox-zero',
      title: 'Inbox Zero Sovereign',
      description: 'Vanquish 50 clutter emails across all factions.',
      icon: '👑',
      reward: 'Mythic Relic Crown & 500 Gold',
      unlocked: clutterDefeated >= 50,
      progress: `${Math.min(clutterDefeated, 50)} / 50 Clutter Purged`
    },
    {
      id: 'boss-slayer',
      title: 'Dread Hydra Vanquisher',
      description: 'Defeat the 500 HP Mega Clutter Boss in a raid battle.',
      icon: '🐉',
      reward: 'Legendary Excalibur of Archiving',
      unlocked: false,
      progress: 'Boss Raid Unlocks at LVL 5'
    }
  ];

  const handleOpenChest = () => {
    if (chestOpened) return;
    sound.playLevelUp();
    setChestOpened(true);
    setChestLoot('🎁 Loot Found: +350 Gold Coins & Mythic "Paladin of Zero" Armor!');
    announce('Kingdom Treasure Chest opened! Claimed 350 Gold and Paladin of Zero Armor!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewards-modal-title"
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid var(--gold-light)',
          padding: '28px',
          borderRadius: '18px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          aria-label="Close Rewards Modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Trophy size={28} color="#0f172a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 id="rewards-modal-title" style={{ fontSize: '1.4rem', color: '#fef3c7', fontWeight: 800 }}>
                Kingdom Armory & Rewards
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  fontWeight: 700
                }}
              >
                LVL {level} Paladin • {xp} XP
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Gamified trophies, daily streak buffs, and productivity loot chests
            </p>
          </div>
        </div>

        {/* Daily Streak & Chest Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}
            >
              🔥
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>
                  3-Day Productivity Streak!
                </span>
                <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 700 }}>
                  [+25% XP Buff Active]
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Clean at least 5 clutter emails each day to level up your streak multiplier.
              </p>
            </div>
          </div>

          {/* Interactive Treasure Chest */}
          <div>
            {!chestOpened ? (
              <button
                onClick={handleOpenChest}
                className="btn-primary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Gift size={18} />
                <span>Open Daily Vault Chest</span>
              </button>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#6ee7b7',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {chestLoot}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Grid */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700, marginBottom: '14px' }}>
            Heroic Achievements & Unlockables
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '14px'
            }}
          >
            {achievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  background: ach.unlocked ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.7)',
                  border: ach.unlocked
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(100, 116, 139, 0.25)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                  opacity: ach.unlocked ? 1 : 0.7
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    flexShrink: 0
                  }}
                >
                  {ach.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: ach.unlocked ? '#fef3c7' : '#94a3b8'
                      }}
                    >
                      {ach.title}
                    </h4>
                    {ach.unlocked ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 700
                        }}
                      >
                        <CheckCircle2 size={13} /> Unlocked
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
                    {ach.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{ach.reward}</span>
                    <span style={{ color: '#94a3b8' }}>{ach.progress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Return to Arena
          </button>
        </div>
      </div>
    </div>
  );
};
