"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Flame, CalendarDays, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogger } from '@/contexts/LoggerContext';
import { getWorkouts } from '@/lib/storage';

// ── Muscle zone definitions (cx,cy = % center; rx,ry = % half-extents) ──────
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

// ── Local-date helpers (avoids toISOString timezone shift) ───────────────────
function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function todayYmd() { return ymd(new Date()); }
function daysAgoYmd(n) { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); }

// ── Stat helpers ─────────────────────────────────────────────────────────────
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

// ── MuscleZone hit area + glow overlay ───────────────────────────────────────
function MuscleZone({ zone, heat, selected, onTap }) {
  const color = HEAT_COLORS[Math.min(heat, 4)];
  const glowOp = heat === 0 ? 0 : Math.min(1, (0.34 + heat * 0.13) * 1.5);

  return (
    <button
      onClick={e => { e.stopPropagation(); onTap(zone); }}
      style={{
        position: 'absolute',
        left: zone.cx + '%',
        top: zone.cy + '%',
        transform: 'translate(-50%, -50%)',
        width: (zone.rx * 2) + '%',
        height: (zone.ry * 2) + '%',
        minWidth: 46,
        minHeight: 46,
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        overflow: 'visible',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* radial heat glow */}
      {heat > 0 && (
        <span style={{
          position: 'absolute', inset: '-8%', borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${color} 0%, ${color}cc 30%, transparent 66%)`,
          filter: 'blur(4px)', mixBlendMode: 'screen', opacity: glowOp,
          animation: heat >= 3 ? 'gt-pulse 2.6s ease-in-out infinite' : 'none',
        }} />
      )}
      {/* outline ring */}
      <span style={{
        position: 'absolute', inset: '14%', borderRadius: '50%', pointerEvents: 'none',
        border: '1.5px solid ' + (selected ? 'var(--brand)' : heat > 0 ? color : 'rgba(255,255,255,0.16)'),
        boxShadow: selected ? '0 0 18px var(--brand-glow)' : 'none',
        background: selected ? 'var(--brand-glow)' : 'transparent',
        opacity: selected ? 1 : 0.6,
        transition: 'all .15s',
      }} />
    </button>
  );
}

// ── Muscle bottom sheet ───────────────────────────────────────────────────────
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
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'flex-end',
        background: shown ? 'rgba(2,4,8,0.62)' : 'rgba(2,4,8,0)',
        backdropFilter: shown ? 'blur(2px)' : 'none',
        transition: 'background .3s, backdrop-filter .3s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '72%',
          background: 'var(--sheet)',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border)', borderBottom: 'none',
          display: 'flex', flexDirection: 'column',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .34s cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--border-strong)' }} />
        </div>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 18px 14px', flexShrink: 0 }}>
          <div>
            <div className="gt-eyebrow">Muscle Group</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--t1)', lineHeight: 0.95, marginTop: 4 }}>
              {zone.name}
            </div>
            {heat > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: heatColor, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--t3)', letterSpacing: '0.1em' }}>
                  {heat}× THIS WEEK
                </span>
              </div>
            )}
          </div>
          <button
            onClick={dismiss}
            style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 19, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* workout list */}
        <div className="gt-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 12px' }}>
          {recent.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map(w => {
                const vol = w.sets.reduce((s, x) => s + x.weight * x.reps, 0);
                return (
                  <div key={w.id} className="gt-card" style={{ padding: '12px 14px', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--t1)' }}>{w.exerciseName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', letterSpacing: '0.06em', flexShrink: 0, marginLeft: 8 }}>{w.date}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {w.sets.map((s, i) => (
                        <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t2)', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 6 }}>
                          {s.setNumber}&nbsp;&nbsp;{s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps}r`}
                        </span>
                      ))}
                    </div>
                    {vol > 0 && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand)', marginTop: 8, letterSpacing: '0.06em' }}>
                        {vol} KG TOTAL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>
                <Target size={22} color="var(--t3)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                No Recent Sets
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
                Time to work those {zone.name.toLowerCase()}.
              </div>
            </div>
          )}
        </div>

        {/* Log CTA */}
        <div style={{ padding: '12px 18px 28px', flexShrink: 0 }}>
          <button
            onClick={() => { dismiss(); setTimeout(() => onLog(zone.base), 340); }}
            className="gt-btn-primary"
            style={{ width: '100%', padding: '15px 0', fontSize: 16, border: 'none', cursor: 'pointer' }}
          >
            Log {zone.name}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AnatomyViewer ────────────────────────────────────────────────────────────
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
    { Icon: Flame,       value: streak,    label: 'day streak',     color: 'var(--orange)' },
    { Icon: CalendarDays, value: weekCount, label: 'this week',     color: 'var(--brand)'  },
    { Icon: Target,      value: litCount,  label: 'active muscles', color: 'var(--red)'    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '12px 18px 0' }}>

      {/* ── Wordmark ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 44, flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--brand)', transform: 'rotate(-6deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="#0a0c10" stroke="none">
            <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, fontStyle: 'italic', letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--t1)' }}>
          Gym<span style={{ color: 'var(--brand)' }}>Track</span>
        </span>
      </div>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 2 }}>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 27, lineHeight: 0.95, letterSpacing: '0.01em', textTransform: 'uppercase', color: 'var(--t1)' }}>
          Training Map
        </div>

        {/* Front / Back segmented toggle */}
        <div style={{ display: 'flex', padding: 3, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', flexShrink: 0 }}>
          {['front', 'back'].map(v => (
            <button key={v} onClick={() => flip(v)} style={{ padding: '7px 13px', borderRadius: 9, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', background: view === v ? 'var(--brand)' : 'transparent', color: view === v ? '#0a0c10' : 'var(--t2)', transition: 'all .15s' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mini stat strip ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexShrink: 0 }}>
        {statCells.map(({ Icon, value, label, color }, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Icon size={17} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />
            <div style={{ lineHeight: 1, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: 0.9, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em' }}>
                {value}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 3, whiteSpace: 'nowrap' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Figure stage ── */}
      <div
        style={{
          flex: 1, position: 'relative', minHeight: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 26, overflow: 'hidden',
          background: 'radial-gradient(80% 60% at 50% 42%, color-mix(in srgb, var(--brand) 9%, transparent), transparent 70%)',
          border: '1px solid var(--border)',
          userSelect: 'none',
        }}
        onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
      >
        {/* dot grid mask */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', maskImage: 'radial-gradient(70% 60% at 50% 45%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(70% 60% at 50% 45%, #000, transparent 75%)' }} />

        {/* rotated FRONT/BACK edge label */}
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--t3)', pointerEvents: 'none' }}>
          {view}
        </div>

        {/* figure + zones — width-driven container so zones align with rendered image */}
        <div style={{
          position: 'relative',
          width: 'min(56%, 260px)',
          transition: 'opacity .15s, transform .15s',
          opacity: flipping ? 0 : 1,
          transform: flipping ? 'scaleX(0.86)' : 'scaleX(1)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={view === 'front' ? '/anatomy-front-view-no-labels.png' : '/anatomy-rear-view-no-labels.png'}
            alt={`${view} anatomy`}
            draggable={false}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              pointerEvents: 'none',
              filter: 'grayscale(1) brightness(0.52) contrast(1.16) drop-shadow(0 12px 40px rgba(0,0,0,0.6))',
            }}
          />
          {/* overlay exactly covers the rendered image */}
          <div style={{ position: 'absolute', inset: 0 }}>
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

      {/* ── Heat legend ── */}
      <div style={{ padding: '10px 2px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="gt-eyebrow" style={{ flexShrink: 0 }}>Last 7 days</div>
          <div style={{ flex: 1, height: 7, borderRadius: 99, background: 'linear-gradient(90deg, #334155, #fde047, #fb923c, #f43f5e, #dc2626)', opacity: 0.9 }} />
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>
            <span>Rest</span>
            <span>›</span>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>Fire</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, color: 'var(--t3)', fontSize: 12.5 }}>
          <Target size={13} />
          Tap a muscle for its log · swipe to flip
        </div>
      </div>

      {/* ── Muscle detail sheet ── */}
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
