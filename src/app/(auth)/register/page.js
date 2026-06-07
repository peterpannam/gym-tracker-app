"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// size prop is dynamic, so width/height/borderRadius/fontSize must stay inline
function Wordmark({ size = 38 }) {
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

function PinDots({ count, shake }) {
  return (
    <div className={`flex gap-[14px] justify-center my-[34px] ${shake ? 'gt-shake' : ''}`}>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="size-4 rounded-full transition-all duration-150"
          style={{
            background: i < count ? 'var(--brand)' : 'transparent',
            border: '2px solid ' + (i < count ? 'var(--brand)' : 'var(--border-strong)'),
            boxShadow: i < count ? '0 0 14px var(--brand-glow)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { createProfile } = useAuth();
  const router = useRouter();
  const [step, setStep]     = useState('name');
  const [name, setName]     = useState('');
  const [pinA, setPinA]     = useState('');
  const [pin, setPin]       = useState('');
  const [shake, setShake]   = useState(false);
  const [nameErr, setNameErr] = useState('');

  function goToPin() {
    if (!name.trim()) {
      setShake(true);
      setNameErr('Enter your name');
      setTimeout(() => setShake(false), 400);
      return;
    }
    setNameErr('');
    setStep('pin');
    setPin('');
  }

  function addDigit(d) {
    if (pin.length >= 4) return;
    const np = pin + d;
    setPin(np);
    if (np.length === 4) {
      if (step === 'pin') {
        setTimeout(() => { setPinA(np); setPin(''); setStep('confirm'); }, 260);
      } else {
        setTimeout(() => {
          if (np === pinA) {
            createProfile(name.trim(), np);
            router.push('/dashboard');
          } else {
            setShake(true);
            setPin('');
            setTimeout(() => {
              setShake(false);
              setPinA('');
              setStep('pin');
            }, 400);
          }
        }, 260);
      }
    }
  }

  const subCopy = {
    name:    'Claim your tile. Start your streak.',
    pin:     'Choose a 4-digit PIN.',
    confirm: 'Enter your PIN again to confirm.',
  }[step];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col px-6 pt-16 pb-[34px] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-[120px] -left-[80px] size-[320px] rounded-full opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--brand-glow), transparent 70%)' }} />
      <div className="absolute bottom-[40px] -right-[120px] size-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.18), transparent 70%)' }} />

      <div className="relative">
        <Wordmark size={38} />
      </div>

      <div className="relative mt-[26px] flex-1 flex flex-col">

        {step === 'name' ? (
          <Link
            href="/login"
            className="self-start flex items-center gap-[6px] text-t2 text-[13.5px] font-medium no-underline"
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => { setStep('name'); setPin(''); setPinA(''); }}
            className="self-start flex items-center gap-[6px] bg-transparent border-0 text-t2 text-[13.5px] cursor-pointer p-0"
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
        )}

        <div className="gt-display mt-[22px] text-[30px] text-t1">NEW ATHLETE</div>
        <div className="text-t2 text-[14px] mt-1">{subCopy}</div>

        {/* Name step */}
        {step === 'name' && (
          <>
            <div className="mt-7">
              <div className="gt-eyebrow mb-[10px]">Your name</div>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameErr(''); }}
                placeholder="e.g. Alex"
                autoFocus
                className={`w-full box-border px-[18px] py-4 rounded-[18px] bg-surface text-t1 text-[18px] font-display font-medium tracking-[0.01em] outline-none border ${nameErr ? 'border-red' : 'border-border-strong'} ${shake ? 'gt-shake' : ''}`}
              />
              {nameErr && (
                <div className="text-red text-[13px] font-semibold mt-2">{nameErr}</div>
              )}
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={goToPin}
              className="w-full py-[17px] rounded-[18px] cursor-pointer border-0 bg-brand text-[#0a0c10] font-display font-bold text-[19px] tracking-[var(--display-ls)] uppercase flex items-center justify-center gap-2"
              style={{ boxShadow: '0 10px 30px var(--brand-glow)' }}
            >
              Continue <ChevronRight size={20} strokeWidth={2.6} />
            </button>

            <p className="text-center text-t3 text-[13px] mt-4">
              Already have a profile?{' '}
              <Link href="/login" className="text-brand font-semibold no-underline">Log in</Link>
            </p>
          </>
        )}

        {/* PIN / Confirm steps */}
        {(step === 'pin' || step === 'confirm') && (
          <>
            <PinDots count={pin.length} shake={shake} />
            <Keypad onDigit={addDigit} onDelete={() => setPin(p => p.slice(0, -1))} />
          </>
        )}
      </div>
    </div>
  );
}
