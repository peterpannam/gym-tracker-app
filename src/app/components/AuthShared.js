"use client";
import { Zap, X } from 'lucide-react';

// size prop is dynamic, so width/height/borderRadius/fontSize must stay inline
export function Wordmark({ size = 44 }) {
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

export function Keypad({ onDigit, onDelete }) {
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
