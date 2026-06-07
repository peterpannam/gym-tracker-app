"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Flame, CalendarDays, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogger } from '@/contexts/LoggerContext';
import { getWorkouts } from '@/lib/storage';

const MUSCLE_ZONES = {
  front: [
    { id: 'shoulders-l', base: 'shoulders', name: 'Shoulders', cx: 31, cy: 25, rx: 7,  ry: 6  },
    { id: 'shoulders-r', base: 'shoulders', name: 'Shoulders', cx: 69, cy: 25, rx: 7,  ry: 6  },
    { id: 'chest',       base: 'chest',     name: 'Chest',     cx: 50, cy: 29, rx: 13, ry: 7  },
    { id: 'biceps-l',    base: 'biceps',    name: 'Biceps',    cx: 27, cy: 35, rx: 6,  ry: 7  },
    { id: 'biceps-r',    base: 'biceps',    name: 'Biceps',    cx: 73, cy: 35, rx: 6,  ry: 7  },
    { id: 'abs',         base: 'abs',       name: 'Abs',       cx: 50, cy: 43, rx: 8,  ry: 8  },
    { id: 'forearms-l',  base: 'forearms',  name: 'Forearms',  cx: 23, cy: 47, rx: 5,  ry: 8  },
    { id: 'forearms-r',  base: 'forearms',  name: 'Forearms',  cx: 77, cy: 47, rx: 5,  ry: 8  },
    { id: 'quads-l',     base: 'quads',     name: 'Quads',     cx: 43, cy: 61, rx: 7,  ry: 11 },
    { id: 'quads-r',     base: 'quads',     name: 'Quads',     cx: 57, cy: 61, rx: 7,  ry: 11 },
    { id: 'calves-l',    base: 'calves',    name: 'Calves',    cx: 44, cy: 83, rx: 5,  ry: 8  },
    { id: 'calves-r',    base: 'calves',    name: 'Calves',    cx: 56, cy: 83, rx: 5,  ry: 8  },
  ],
  back: [
    { id: 'traps',        base: 'traps',      name: 'Traps',      cx: 50, cy: 23, rx: 11, ry: 6  },
    { id: 'reardelts-l',  base: 'rear-delts', name: 'Rear Delts', cx: 32, cy: 26, rx: 7,  ry: 5  },
    { id: 'reardelts-r',  base: 'rear-delts', name: 'Rear Delts', cx: 68, cy: 26, rx: 7,  ry: 5  },
    { id: 'triceps-l',    base: 'triceps',    name: 'Triceps',    cx: 28, cy: 35, rx: 6,  ry: 7  },
    { id: 'triceps-r',    base: 'triceps',    name: 'Triceps',    cx: 72, cy: 35, rx: 6,  ry: 7  },
    { id: 'lats-l',       base: 'lats',       name: 'Lats',       cx: 40, cy: 37, rx: 7,  ry: 9  },
    { id: 'lats-r',       base: 'lats',       name: 'Lats',       cx: 60, cy: 37, rx: 7,  ry: 9  },
    { id: 'lowerback',    base: 'lower-back', name: 'Lower Back', cx: 50, cy: 47, rx: 9,  ry: 6  },
    { id: 'glutes',       base: 'glutes',     name: 'Glutes',     cx: 50, cy: 55, rx: 11, ry: 7  },
    { id: 'hamstrings-l', base: 'hamstrings', name: 'Hamstrings', cx: 44, cy: 68, rx: 6,  ry: 10 },
    { id: 'hamstrings-r', base: 'hamstrings', name: 'Hamstrings', cx: 56, cy: 68, rx: 6,  ry: 10 },
    { id: 'calvesb-l',    base: 'calves',     name: 'Calves',     cx: 44, cy: 85, rx: 5,  ry: 8  },
    { id: 'calvesb-r',    base: 'calves',     name: 'Calves',     cx: 56, cy: 85, rx: 5,  ry: 8  },
  ],
};

const HEAT_COLORS = ['#64748b', '#fde047', '#fb923c', '#f43f5e', '#dc2626'];

function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function todayYmd() { return ymd(new Date()); }
function daysAgoYmd(n) { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); }

function ts(w) {
  return typeof w.timestamp === 'number' ? w.timestamp : new Date(w.timestamp).getTime();
}

function heatForMuscle(base, workouts) {
  const weekAgo = Date.now() - 7 * 864e5;
  const count = workouts.filter(w => ts(w) >= weekAgo && w.targetedMuscles?.includes(base)).length;
  return Math.min(count, 4);
}

function workoutStreak(workouts) {
  if (!workouts.length) return 0;
  const days = [...new Set(workouts.map(w => w.date))].sort().reverse();
  if (days[0] !== todayYmd() && days[0] !== daysAgoYmd(1)) return 0;
  let streak = 0, cursor = days[0];
  for (const day of days) {
    if (day === cursor) {
      streak++;
      const d = new Date(cursor + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      cursor = ymd(d);
    } else break;
  }
  return streak;
}

function thisWeekCount(workouts) {
  const weekAgo = Date.now() - 7 * 864e5;
  return new Set(workouts.filter(w => ts(w) >= weekAgo).map(w => w.date)).size;
}

// Muscle zone — positions are data-driven percentages, must stay inline
function MuscleZone({ zone, heat, selected, onTap }) {
  const color = HEAT_COLORS[Math.min(heat, 4)];
  const glowOp = heat === 0 ? 0 : Math.min(1, (0.34 + heat * 0.13) * 1.5);

  return (
    <button
      onClick={e => { e.stopPropagation(); onTap(zone); }}
      className="absolute border-0 bg-transparent p-0 cursor-pointer overflow-visible"
      style={{
        left: zone.cx + '%',
        top: zone.cy + '%',
        transform: 'translate(-50%, -50%)',
        width: (zone.rx * 2) + '%',
        height: (zone.ry * 2) + '%',
        minWidth: 46,
        minHeight: 46,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {heat > 0 && (
        <span
          className="absolute pointer-events-none"
          style={{
            inset: '-8%', borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, ${color}cc 30%, transparent 66%)`,
            filter: 'blur(4px)', mixBlendMode: 'screen', opacity: glowOp,
            animation: heat >= 3 ? 'gt-pulse 2.6s ease-in-out infinite' : 'none',
          }}
        />
      )}
      <span
        className="absolute pointer-events-none transition-all duration-150"
        style={{
          inset: '14%', borderRadius: '50%',
          border: '1.5px solid ' + (selected ? 'var(--brand)' : heat > 0 ? color : 'rgba(255,255,255,0.16)'),
          boxShadow: selected ? '0 0 18px var(--brand-glow)' : 'none',
          background: selected ? 'var(--brand-glow)' : 'transparent',
          opacity: selected ? 1 : 0.6,
        }}
      />
    </button>
  );
}

function MuscleSheet({ zone, workouts, onClose, onLog }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  function dismiss() {
    setShown(false);
    setTimeout(onClose, 340);
  }

  const heat = heatForMuscle(zone.base, workouts);
  const heatColor = HEAT_COLORS[heat];
  const recent = workouts.filter(w => w.targetedMuscles?.includes(zone.base)).slice(0, 5);

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[60] flex items-end"
      style={{
        background: shown ? 'rgba(2,4,8,0.62)' : 'rgba(2,4,8,0)',
        backdropFilter: shown ? 'blur(2px)' : 'none',
        transition: 'background .3s, backdrop-filter .3s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-h-[72%] bg-sheet rounded-t-[28px] overflow-hidden border border-b-0 border-border flex flex-col"
        style={{
          boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .34s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-[10px] shrink-0">
          <div className="w-10 h-[5px] rounded-full bg-border-strong" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-[18px] pt-3 pb-[14px] shrink-0">
          <div>
            <div className="gt-eyebrow">Muscle Group</div>
            <div className="font-display font-bold text-[25px] tracking-[0.01em] uppercase text-t1 leading-[0.95] mt-1">
              {zone.name}
            </div>
            {heat > 0 && (
              <div className="flex items-center gap-[6px] mt-[7px]">
                <span
                  className="size-[7px] rounded-full inline-block shrink-0"
                  style={{ background: heatColor }}
                />
                <span className="font-mono text-[10.5px] text-t3 tracking-[0.1em]">
                  {heat}× THIS WEEK
                </span>
              </div>
            )}
          </div>
          <button
            onClick={dismiss}
            className="size-9 rounded-[12px] bg-surface-2 border-0 cursor-pointer text-t2 flex items-center justify-center shrink-0 text-[19px] leading-none"
          >
            ×
          </button>
        </div>

        {/* Workout list */}
        <div className="gt-scroll flex-1 overflow-y-auto px-[18px] pb-3">
          {recent.length > 0 ? (
            <div className="flex flex-col gap-[10px]">
              {recent.map(w => {
                const vol = w.sets.reduce((s, x) => s + x.weight * x.reps, 0);
                return (
                  <div key={w.id} className="gt-card px-[14px] py-3 rounded-[14px]">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-[14.5px] text-t1">{w.exerciseName}</span>
                      <span className="font-mono text-[10px] text-t3 tracking-[0.06em] shrink-0 ml-2">{w.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {w.sets.map((s, i) => (
                        <span key={i} className="font-mono text-[11px] text-t2 bg-surface-2 px-2 py-1 rounded-[6px]">
                          {s.setNumber}&nbsp;&nbsp;{s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps}r`}
                        </span>
                      ))}
                    </div>
                    {vol > 0 && (
                      <div className="font-mono text-[10.5px] text-brand mt-2 tracking-[0.06em]">
                        {vol} KG TOTAL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="size-11 rounded-[14px] bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <Target size={22} color="var(--t3)" />
              </div>
              <div className="font-display font-bold text-[17px] text-t1 uppercase tracking-[0.01em]">
                No Recent Sets
              </div>
              <div className="text-[13px] text-t2 mt-[6px]">
                Time to work those {zone.name.toLowerCase()}.
              </div>
            </div>
          )}
        </div>

        {/* Log CTA */}
        <div className="px-[18px] pt-3 pb-7 shrink-0">
          <button
            onClick={() => { dismiss(); setTimeout(() => onLog(zone.base), 340); }}
            className="gt-btn-primary w-full py-[15px] text-[16px] border-0 cursor-pointer"
          >
            Log {zone.name}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnatomyViewer() {
  const { currentProfile } = useAuth();
  const { openLogger } = useLogger();
  const [view, setView] = useState('front');
  const [selected, setSelected] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const dragRef = useRef(null);

  useEffect(() => {
    if (currentProfile) setWorkouts(getWorkouts(currentProfile.profileId));
  }, [currentProfile]);

  function flip(to) {
    if (to === view) return;
    setFlipping(true);
    setTimeout(() => { setView(to); setTimeout(() => setFlipping(false), 30); }, 150);
  }

  function onPointerDown(e) {
    dragRef.current = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onPointerMove(e) {
    if (dragRef.current == null) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    if (Math.abs(x - dragRef.current) > 55) {
      flip(x < dragRef.current ? 'back' : 'front');
      dragRef.current = null;
    }
  }
  function onPointerUp() { dragRef.current = null; }

  const zones = MUSCLE_ZONES[view];
  const streak = workoutStreak(workouts);
  const weekCount = thisWeekCount(workouts);
  const litCount = new Set(zones.filter(z => heatForMuscle(z.base, workouts) > 0).map(z => z.base)).size;

  const statCells = [
    { Icon: Flame,        value: streak,    label: 'day streak',     color: 'var(--orange)' },
    { Icon: CalendarDays, value: weekCount, label: 'this week',      color: 'var(--brand)'  },
    { Icon: Target,       value: litCount,  label: 'active muscles', color: 'var(--red)'    },
  ];

  return (
    <div className="flex flex-col min-h-full px-[18px] pt-3">

      {/* Wordmark */}
      <div className="flex items-center gap-[7px] h-11 shrink-0">
        <div className="size-[22px] rounded-[7px] bg-brand -rotate-6 flex items-center justify-center shrink-0">
          <svg width={13} height={13} viewBox="0 0 24 24" fill="#0a0c10" stroke="none">
            <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
          </svg>
        </div>
        <span className="font-display font-bold text-[17px] italic tracking-[0.01em] uppercase text-t1">
          Gym<span className="text-brand">Track</span>
        </span>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-[10px] mt-[2px]">
        <div className="font-display font-bold text-[27px] leading-[0.95] tracking-[0.01em] uppercase text-t1">
          Training Map
        </div>
        <div className="flex p-[3px] rounded-[12px] bg-surface border border-border shrink-0">
          {['front', 'back'].map(v => (
            <button
              key={v}
              onClick={() => flip(v)}
              className={`px-[13px] py-[7px] rounded-[9px] border-0 font-display font-semibold text-[13px] tracking-[0.04em] uppercase cursor-pointer transition-all duration-150 ${
                view === v ? 'bg-brand text-[#0a0c10]' : 'bg-transparent text-t2'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Mini stat strip */}
      <div className="flex gap-2 mb-[10px] shrink-0">
        {statCells.map(({ Icon, value, label, color }, i) => (
          <div key={i} className="flex-1 flex items-center gap-[9px] px-[11px] py-[9px] rounded-[14px] bg-surface border border-border">
            <Icon size={17} color={color} strokeWidth={2} className="shrink-0" />
            <div className="leading-none overflow-hidden">
              <div className="font-display font-bold text-[20px] leading-[0.9] text-t1 tabular-nums tracking-[0.01em]">
                {value}
              </div>
              <div className="text-[9.5px] text-t3 mt-[3px] whitespace-nowrap">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Figure stage */}
      <div
        className="flex-1 relative min-h-[300px] flex items-center justify-center rounded-[26px] overflow-hidden border border-border select-none"
        style={{
          background: 'radial-gradient(80% 60% at 50% 42%, color-mix(in srgb, var(--brand) 9%, transparent), transparent 70%)',
        }}
        onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(70% 60% at 50% 45%, #000, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 50% 45%, #000, transparent 75%)',
          }}
        />

        {/* Rotated view label */}
        <div
          className="absolute right-2 top-1/2 font-display font-bold text-[13px] tracking-[0.4em] uppercase text-t3 pointer-events-none"
          style={{ transform: 'translateY(-50%) rotate(90deg)' }}
        >
          {view}
        </div>

        {/* Figure + zones */}
        <div
          className="relative"
          style={{
            width: 'min(56%, 260px)',
            transition: 'opacity .15s, transform .15s',
            opacity: flipping ? 0 : 1,
            transform: flipping ? 'scaleX(0.86)' : 'scaleX(1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={view === 'front' ? '/anatomy-front-view-no-labels.png' : '/anatomy-rear-view-no-labels.png'}
            alt={`${view} anatomy`}
            draggable={false}
            className="w-full h-auto block pointer-events-none"
            style={{ filter: 'grayscale(1) brightness(0.52) contrast(1.16) drop-shadow(0 12px 40px rgba(0,0,0,0.6))' }}
          />
          <div className="absolute inset-0">
            {zones.map(z => (
              <MuscleZone
                key={z.id}
                zone={z}
                heat={heatForMuscle(z.base, workouts)}
                selected={selected?.id === z.id}
                onTap={setSelected}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heat legend */}
      <div className="px-[2px] pt-[10px] pb-[14px] shrink-0">
        <div className="flex items-center gap-[10px]">
          <div className="gt-eyebrow shrink-0">Last 7 days</div>
          <div
            className="flex-1 h-[7px] rounded-full opacity-90"
            style={{ background: 'linear-gradient(90deg, #334155, #fde047, #fb923c, #f43f5e, #dc2626)' }}
          />
          <div className="flex gap-[5px] items-center text-t3 text-[11px] shrink-0">
            <span>Usage indicator</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-[6px] mt-[10px] text-t3 text-[12.5px]">
          <Target size={13} />
          Tap a muscle for its log · swipe to flip
        </div>
      </div>

      {selected && (
        <MuscleSheet
          zone={selected}
          workouts={workouts}
          onClose={() => setSelected(null)}
          onLog={base => {
            setSelected(null);
            setTimeout(() => openLogger(base), 340);
          }}
        />
      )}
    </div>
  );
}
