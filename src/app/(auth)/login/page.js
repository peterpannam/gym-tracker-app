"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles } from '@/lib/storage';

function Wordmark({ size = 44 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size * 0.92, height: size * 0.92, borderRadius: size * 0.26,
        background: 'var(--brand)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 28px var(--brand-glow)', transform: 'rotate(-6deg)',
      }}>
        <Zap size={size * 0.5} fill="#0a0c10" strokeWidth={0} />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size,
        lineHeight: 0.86, letterSpacing: 'var(--display-ls)',
        color: 'var(--t1)', fontStyle: 'italic', textTransform: 'uppercase',
      }}>
        Gym<span style={{ color: 'var(--brand)' }}>Track</span>
      </div>
    </div>
  );
}

function Keypad({ onDigit, onDelete }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {keys.map((k, i) => {
        if (k === '') return <div key={i} />;
        const isDel = k === 'del';
        return (
          <button
            key={i}
            type="button"
            onClick={() => isDel ? onDelete() : onDigit(k)}
            style={{
              height: 60, borderRadius: 18, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--t1)', fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s',
            }}
            onMouseDown={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseUp={e => { e.currentTarget.style.background = 'var(--surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
          >
            {isDel ? <X size={22} strokeWidth={2.4} /> : k}
          </button>
        );
      })}
    </div>
  );
}

export default function LoginPage() {
  const { login, currentProfile, isLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [mode, setMode]   = useState('select'); // 'select' | 'pin'
  const [sel, setSel]     = useState(null);
  const [pin, setPin]     = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!isLoading && currentProfile) router.replace('/dashboard');
  }, [currentProfile, isLoading, router]);

  useEffect(() => { setProfiles(getProfiles()); }, []);

  function pickProfile(p) { setSel(p); setPin(''); setMode('pin'); }

  function addDigit(d) {
    if (pin.length >= 4) return;
    const np = pin + d;
    setPin(np);
    if (np.length === 4) {
      setTimeout(() => {
        if (login(sel.id, np)) {
          router.push('/dashboard');
        } else {
          setShake(true);
          setPin('');
          setTimeout(() => setShake(false), 400);
        }
      }, 260);
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--t3)', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      padding: '64px 24px 34px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: -120, left: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--brand-glow), transparent 70%)',
        opacity: 0.5, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 40, right: -120,
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,146,60,0.18), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── SELECT ──────────────────────────────────────────────────────── */}
      {mode === 'select' && (
        <>
          <div style={{ position: 'relative', marginTop: 18 }}>
            <Wordmark size={50} />
            <div style={{ marginTop: 22, maxWidth: 280 }}>
              <div className="gt-display" style={{ fontSize: 34, lineHeight: 0.98, color: 'var(--t1)' }}>
                Time to<br /><span style={{ color: 'var(--brand)' }}>train.</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', marginTop: 30, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {profiles.length === 0 ? (
              <>
                <p style={{ color: 'var(--t2)', fontSize: 14.5, lineHeight: 1.5, maxWidth: 280 }}>
                  No profiles yet. Create one to start tracking your workouts.
                </p>
                <Link
                  href="/register"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '17px', borderRadius: 18, textDecoration: 'none',
                    background: 'var(--brand)', color: '#0a0c10',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 19, letterSpacing: 'var(--display-ls)', textTransform: 'uppercase',
                    boxShadow: '0 10px 30px var(--brand-glow)',
                  }}
                >
                  Create Profile <ChevronRight size={20} strokeWidth={2.6} />
                </Link>
              </>
            ) : (
              <>
                <div className="gt-eyebrow" style={{ marginBottom: 2 }}>
                  Profiles &middot; {profiles.length}
                </div>

                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickProfile(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', cursor: 'pointer', borderRadius: 20,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      textAlign: 'left', transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: 'linear-gradient(140deg, var(--surface-2), #0c0f15)',
                      border: '1px solid var(--border-strong)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: 22, color: 'var(--brand)', letterSpacing: 'var(--display-ls)',
                    }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21,
                        letterSpacing: 'var(--display-ls)', color: 'var(--t1)',
                        textTransform: 'uppercase', lineHeight: 1,
                      }}>{p.name}</div>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                  </button>
                ))}

                <Link
                  href="/register"
                  style={{
                    marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 20, textDecoration: 'none',
                    border: '1px dashed var(--border-strong)', background: 'transparent',
                    color: 'var(--t2)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New athlete
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {/* ── PIN ─────────────────────────────────────────────────────────── */}
      {mode === 'pin' && sel && (
        <>
          <div style={{ position: 'relative', marginTop: 6 }}>
            <Wordmark size={38} />
          </div>

          <div style={{ position: 'relative', marginTop: 26, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => { setMode('select'); setPin(''); setSel(null); }}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: 'var(--t2)',
                fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Switch athlete
            </button>

            <div className="gt-display" style={{ marginTop: 22, fontSize: 30, color: 'var(--t1)' }}>
              HEY {sel.name.toUpperCase()}
            </div>
            <div style={{ color: 'var(--t2)', fontSize: 14, marginTop: 4 }}>
              Enter your PIN to lock in.
            </div>

            {/* PIN dots */}
            <div
              className={shake ? 'gt-shake' : undefined}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', margin: '34px 0 30px' }}
            >
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: i < pin.length ? 'var(--brand)' : 'transparent',
                  border: '2px solid ' + (i < pin.length ? 'var(--brand)' : 'var(--border-strong)'),
                  boxShadow: i < pin.length ? '0 0 14px var(--brand-glow)' : 'none',
                  transition: 'all .15s',
                }} />
              ))}
            </div>

            <Keypad onDigit={addDigit} onDelete={() => setPin(p => p.slice(0, -1))} />
          </div>
        </>
      )}
    </div>
  );
}
