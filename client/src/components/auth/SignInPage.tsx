import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, Lock, Zap, BookOpen, CreditCard, GraduationCap, ChevronRight } from 'lucide-react';

interface SignInPageProps {
  isLoading: boolean;
  oauthError?: string | null;
  onLoginClick: () => void;
  onDemoClick: () => void;
}

const FEATURES = [
  {
    icon: <Shield size={22} color="#10b981" />,
    title: 'Ironclad Protection Engine',
    desc: 'Your college notices, offer letters, OTPs and bank alerts are permanently protected with HTTP 403 enforcement. Never accidentally archived.'
  },
  {
    icon: <Sparkles size={22} color="#f59e0b" />,
    title: 'Gemini AI Classification',
    desc: 'Every email is classified in real-time by Gemini AI into Spam Goblins, Promotion Orcs, Newsletter Skeletons and Sacred Relics.'
  },
  {
    icon: <Zap size={22} color="#38bdf8" />,
    title: 'Real-Time Gmail Sync',
    desc: 'Live Server-Sent Events stream reflects inbox changes instantly. Battle monsters and watch your Gmail update in real-time.'
  },
  {
    icon: <Lock size={22} color="#a855f7" />,
    title: 'One-Click Undo',
    desc: 'Every action is reversible. The Chronos Time Chamber logs every battle action and restores emails to their exact previous state.'
  }
];

const PROTECTED_CATEGORIES = [
  { icon: <GraduationCap size={16} color="#38bdf8" />, label: 'University & College Notices', badge: '📜 Royal Scroll' },
  { icon: <BookOpen size={16} color="#a78bfa" />, label: 'Job Offers & Internship Letters', badge: '💎 Knowledge Crystal' },
  { icon: <CreditCard size={16} color="#fbbf24" />, label: 'Bank Alerts & OTP Codes', badge: '👑 Golden Relic' }
];

export const SignInPage: React.FC<SignInPageProps> = ({
  isLoading,
  oauthError,
  onLoginClick,
  onDemoClick
}) => {
  const [hoveredBtn, setHoveredBtn] = useState<'login' | 'demo' | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Atmospheric background orbs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-5%', width: '600px', height: '600px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', top: '40%', right: '10%', width: '300px', height: '300px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '960px', margin: '0 auto' }}>

        {/* ── Hero Header ─────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          {/* Logo mark */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            boxShadow: '0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.2)',
            marginBottom: '24px'
          }}>
            <Shield size={44} color="#0f172a" />
          </div>

          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '0.06em',
            textShadow: '0 0 30px rgba(245,158,11,0.4)',
            marginBottom: '8px'
          }}>
            INBOX QUEST AI
          </h1>

          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
            color: '#f59e0b',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '20px',
            fontWeight: 600
          }}>
            Kingdom of Productivity
          </p>

          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            Turn email triage into a <strong style={{ color: '#f8fafc' }}>fantasy RPG</strong>.
            Slay Spam Goblins, defeat Promotion Orcs, and protect your Sacred Relics
            — powered by <strong style={{ color: '#f59e0b' }}>Google Gemini AI</strong>.
          </p>
        </div>

        {/* ── Sign-In Card + Features ──────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '24px',
          alignItems: 'start'
        }}
          className="signin-grid"
        >
          {/* LEFT — Sign-In Card */}
          <div className="glass-panel" style={{ padding: '36px', border: '1px solid rgba(245,158,11,0.25)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>
              Enter the Kingdom
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '28px' }}>
              Sign in with Google to connect your real Gmail inbox, or try the full experience with 200 demo emails — no login required.
            </p>

            {/* OAuth error banner */}
            {oauthError && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                color: '#fca5a5'
              }}>
                ⚠️ {oauthError}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={onLoginClick}
              disabled={isLoading}
              onMouseEnter={() => setHoveredBtn('login')}
              onMouseLeave={() => setHoveredBtn(null)}
              aria-label="Sign in with your Google account to access your real Gmail inbox"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px 24px',
                borderRadius: '12px',
                border: '2px solid rgba(245,158,11,0.5)',
                background: hoveredBtn === 'login'
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(180,83,9,0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(180,83,9,0.1) 100%)',
                color: '#fbbf24',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hoveredBtn === 'login' ? '0 0 24px rgba(245,158,11,0.35)' : 'none',
                marginBottom: '14px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {/* Google "G" logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <LogIn size={18} />
              <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(147,197,253,0.15)' }} />
              <span style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(147,197,253,0.15)' }} />
            </div>

            {/* Demo Mode Button */}
            <button
              onClick={onDemoClick}
              disabled={isLoading}
              onMouseEnter={() => setHoveredBtn('demo')}
              onMouseLeave={() => setHoveredBtn(null)}
              aria-label="Try Demo Mode with 200 realistic sample emails — no login required"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '13px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(56,189,248,0.35)',
                background: hoveredBtn === 'demo'
                  ? 'rgba(56,189,248,0.12)'
                  : 'rgba(56,189,248,0.06)',
                color: '#38bdf8',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <Sparkles size={16} color="#38bdf8" />
              <span>Try Demo Mode</span>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(56,189,248,0.2)',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: '8px',
                padding: '2px 7px',
                fontWeight: 700,
                marginLeft: '4px'
              }}>
                200 emails
              </span>
            </button>

            {/* Privacy note */}
            <div style={{
              marginTop: '22px',
              padding: '12px 14px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: '#6ee7b7',
              lineHeight: 1.5
            }}>
              <Shield size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              <strong>Privacy First:</strong> Only your email sender, subject & snippet are sent to Gemini AI.
              Full email bodies are <strong>never accessed or transmitted</strong>. Gmail scope: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '4px' }}>gmail.modify</code> only.
            </div>
          </div>

          {/* RIGHT — Feature Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  border: '1px solid rgba(147,197,253,0.12)'
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '44px', height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid rgba(147,197,253,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Protected Categories Strip ─────────────────── */}
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            These emails are permanently protected — never archived or deleted:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {PROTECTED_CATEGORIES.map((cat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(147,197,253,0.18)',
                  fontSize: '0.82rem',
                  color: '#94a3b8'
                }}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <ChevronRight size={12} color="#475569" />
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{cat.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer note ─────────────────────────────────── */}
        <p style={{ textAlign: 'center', marginTop: '36px', fontSize: '0.75rem', color: '#334155' }}>
          Inbox Quest AI • Built with React, Node.js, Google Gemini API &amp; Gmail API •{' '}
          <strong style={{ color: '#475569' }}>Zero email deletion</strong> • HTTP 403 protection enforced server-side
        </p>
      </div>

      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 700px) {
          .signin-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignInPage;

