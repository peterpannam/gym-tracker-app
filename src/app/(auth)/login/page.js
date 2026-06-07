"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfiles } from '@/lib/storage';

// size prop is dynamic, so width/height/borderRadius/fontSize must stay inline
function Wordmark({ size = 44 }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div
        className="shrink-0 flex items-center justify-center bg-brand shadow-[0_0_28px_var(--brand-glow)] -rotate-6"
        style={{ width: size * 0.92, height: size * 0.92, borderRadius: size * 0.26 }}
      >
        <Zap size={size * 0.5} fill="#0a0c10" strokeWidth={0} />
      </div>
      <div
        className="font-display font-bold leading-[0.86] tracking-[var(--display-ls)] text-t1 italic uppercase"
        style={{ fontSize: size }}
      >
        Gym<span className="text-brand">Track</span>
      </div>
    </div>
  );
}

function Keypad({ onDigit, onDelete }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k, i) => {
        if (k === '') return <div key={i} />;
        const isDel = k === 'del';
        return (
          <button
            key={i}
            type="button"
            onClick={() => isDel ? onDelete() : onDigit(k)}
            className="h-[60px] rounded-[18px] cursor-pointer border border-border bg-surface text-t1 font-display font-semibold text-[26px] flex items-center justify-center transition-[background] duration-[120ms]"
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
  const [mode, setMode]   = useState('select');
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-t3 text-[14px]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col px-6 pt-16 pb-[34px] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-[120px] -left-[80px] size-[320px] rounded-full opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--brand-glow), transparent 70%)' }} />
      <div className="absolute bottom-[40px] -right-[120px] size-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.18), transparent 70%)' }} />

      {/* SELECT mode */}
      {mode === 'select' && (
        <>
          <div className="relative mt-[18px]">
            <Wordmark size={50} />
            <div className="mt-[22px] max-w-[280px]">
              <div className="gt-display text-[34px] leading-[0.98] text-t1">
                Time to<br /><span className="text-brand">train.</span>
              </div>
            </div>
          </div>

          <div className="relative mt-[30px] flex flex-col gap-3 flex-1">
            {profiles.length === 0 ? (
              <>
                <p className="text-t2 text-[14.5px] leading-[1.5] max-w-[280px]">
                  No profiles yet. Create one to start tracking your workouts.
                </p>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 py-[17px] rounded-[18px] no-underline bg-brand text-[#0a0c10] font-display font-bold text-[19px] tracking-[var(--display-ls)] uppercase"
                  style={{ boxShadow: '0 10px 30px var(--brand-glow)' }}
                >
                  Create Profile <ChevronRight size={20} strokeWidth={2.6} />
                </Link>
              </>
            ) : (
              <>
                <div className="gt-eyebrow mb-[2px]">
                  Profiles &middot; {profiles.length}
                </div>

                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickProfile(p)}
                    className="flex items-center gap-[14px] px-4 py-[14px] cursor-pointer rounded-[20px] border border-border bg-surface text-left transition-[border-color] duration-150"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div className="size-12 rounded-[14px] shrink-0 border border-border-strong flex items-center justify-center font-display font-bold text-[22px] text-brand tracking-[var(--display-ls)]"
                      style={{ background: 'linear-gradient(140deg, var(--surface-2), #0c0f15)' }}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-[21px] tracking-[var(--display-ls)] text-t1 uppercase leading-none">
                        {p.name}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-t3 shrink-0" />
                  </button>
                ))}

                <Link
                  href="/register"
                  className="mt-1 flex items-center justify-center gap-2 py-[14px] rounded-[20px] no-underline border border-dashed border-border-strong bg-transparent text-t2 text-[14px] font-semibold"
                >
                  <span className="text-[18px] leading-none">+</span> New athlete
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {/* PIN mode */}
      {mode === 'pin' && sel && (
        <>
          <div className="relative mt-[6px]">
            <Wordmark size={38} />
          </div>

          <div className="relative mt-[26px] flex-1 flex flex-col">
            <button
              type="button"
              onClick={() => { setMode('select'); setPin(''); setSel(null); }}
              className="self-start flex items-center gap-[6px] bg-transparent border-0 text-t2 text-[13.5px] cursor-pointer p-0"
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Switch athlete
            </button>

            <div className="gt-display mt-[22px] text-[30px] text-t1">
              HEY {sel.name.toUpperCase()}
            </div>
            <div className="text-t2 text-[14px] mt-1">Enter your PIN to lock in.</div>

            {/* PIN dots */}
            <div className={`flex gap-[14px] justify-center my-[34px] ${shake ? 'gt-shake' : ''}`}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="size-4 rounded-full transition-all duration-150"
                  style={{
                    background: i < pin.length ? 'var(--brand)' : 'transparent',
                    border: '2px solid ' + (i < pin.length ? 'var(--brand)' : 'var(--border-strong)'),
                    boxShadow: i < pin.length ? '0 0 14px var(--brand-glow)' : 'none',
                  }}
                />
              ))}
            </div>

            <Keypad onDigit={addDigit} onDelete={() => setPin(p => p.slice(0, -1))} />
          </div>
        </>
      )}
    </div>
  );
}
