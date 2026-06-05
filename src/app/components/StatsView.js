"use client";
import { useState, useEffect, useMemo } from 'react';
import { Flame, Calendar, TrendingUp, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts } from '@/lib/storage';

// ── Local date helpers ─────────────────────────────────────────────────────
function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function todayYmd() { return ymd(new Date()); }
function fmtDate(ds) {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

// ── Stat helpers ───────────────────────────────────────────────────────────
function vol(w) { return w.sets.reduce((s, x) => s + x.weight * x.reps, 0); }

function thisWeekCount(workouts) {
  const cutoff = Date.now() - 7 * 864e5;
  return new Set(workouts.filter(w => new Date(w.timestamp).getTime() >= cutoff).map(w => w.date)).size;
}

function workoutStreak(workouts) {
  if (!workouts.length) return 0;
  const days = [...new Set(workouts.map(w => w.date))].sort().reverse();
  const today = todayYmd();
  const d = new Date(); d.setDate(d.getDate() - 1);
  const yesterday = ymd(d);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 0;
  let cursor = days[0];
  for (const day of days) {
    if (day !== cursor) break;
    streak++;
    const dt = new Date(cursor + 'T00:00:00');
    dt.setDate(dt.getDate() - 1);
    cursor = ymd(dt);
  }
  return streak;
}

function buildVolumeByDay(workouts, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = ymd(d);
    const v = workouts.filter(w => w.date === ds).reduce((s, w) => s + vol(w), 0);
    result.push({ date: fmtDate(ds), short: d.toLocaleDateString('en-AU', { weekday: 'narrow' }), volume: Math.round(v) });
  }
  return result;
}

function buildTopExercises(workouts, n = 5) {
  const map = {};
  workouts.forEach(w => { map[w.exerciseName] = (map[w.exerciseName] || 0) + vol(w); });
  return Object.entries(map)
    .map(([name, v]) => ({ name, volume: Math.round(v) }))
    .sort((a, b) => b.volume - a.volume).slice(0, n);
}

const MUSCLE_LABELS = {
  chest: 'Chest', abs: 'Abs', shoulders: 'Shoulders', biceps: 'Biceps',
  forearms: 'Forearms', quads: 'Quads', calves: 'Calves', traps: 'Traps',
  lats: 'Lats', 'lower-back': 'Lower Back', triceps: 'Triceps',
  'rear-delts': 'Rear Delts', glutes: 'Glutes', hamstrings: 'Hamstrings',
};

function buildMuscleFreq(workouts, n = 6) {
  const map = {};
  workouts.forEach(w => {
    (w.targetedMuscles || []).forEach(m => { map[m] = (map[m] || 0) + 1; });
  });
  return Object.entries(map)
    .map(([m, count]) => ({ muscle: MUSCLE_LABELS[m] || m.replace(/-/g, ' '), count }))
    .sort((a, b) => b.count - a.count).slice(0, n);
}

function buildPRs(workouts, n = 6) {
  const records = {};
  workouts.forEach(w => {
    const best = w.sets.reduce((b, s) => s.weight > b.weight ? s : b, { weight: 0, reps: 0 });
    if (!records[w.exerciseName] || best.weight > records[w.exerciseName].weight) {
      records[w.exerciseName] = { weight: best.weight, reps: best.reps, date: w.date };
    }
  });
  return Object.entries(records)
    .map(([exercise, data]) => ({ exercise, ...data }))
    .sort((a, b) => b.weight - a.weight).slice(0, n);
}

// ── Sub-components ─────────────────────────────────────────────────────────
function VolumeChart({ data }) {
  const W = 320, H = 130, pad = 6;
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.volume), 1);
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (d.volume / max) * (H - pad * 2 - 6);
    return [x, y];
  });
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line +
    ` L${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L${pts[0][0].toFixed(1)} ${H - pad} Z`;
  const peakIdx = data.reduce((bi, d, i, a) => d.volume > a[bi].volume ? i : bi, 0);
  const peak = pts[peakIdx];
  const peakV = data[peakIdx].volume;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="gtVolFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(g => (
        <line
          key={g}
          x1={pad} x2={W - pad}
          y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill="url(#gtVolFill)" />
      <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {peakV > 0 && (
        <circle cx={peak[0]} cy={peak[1]} r="4" fill="var(--brand)" stroke="var(--sheet)" strokeWidth="2.5" />
      )}
    </svg>
  );
}

function BarRow({ label, value, max, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
      <div style={{
        width: 96, fontSize: 12.5, color: 'var(--t2)', flexShrink: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{label}</div>
      <div style={{
        flex: 1, height: 10, borderRadius: 99,
        background: 'var(--surface-2)', overflow: 'hidden',
      }}>
        <div style={{
          width: Math.max(4, (value / max) * 100) + '%',
          height: '100%', borderRadius: 99,
          background: color || 'linear-gradient(90deg, var(--brand-deep), var(--brand))',
        }} />
      </div>
      <div style={{
        width: 52, textAlign: 'right',
        fontFamily: 'var(--font-mono)', fontSize: 11.5,
        color: 'var(--t1)', flexShrink: 0,
      }}>{value.toLocaleString()}</div>
    </div>
  );
}

function ScoreCard({ Icon: IconComp, value, unit, label, accent }) {
  return (
    <div style={{
      flex: 1, borderRadius: 18, padding: '14px 13px',
      position: 'relative', overflow: 'hidden',
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <div style={{
        position: 'absolute', top: -16, right: -16,
        width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
      }} />
      <span style={{ color: accent, display: 'flex' }}>
        <IconComp size={18} strokeWidth={2} />
      </span>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 36, lineHeight: 1, letterSpacing: 'var(--display-ls)',
          color: 'var(--t1)',
        }}>{value}</span>
        <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--t2)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div style={{
      borderRadius: 22, border: '1px solid var(--border)',
      background: 'var(--surface)', padding: '16px 16px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="gt-eyebrow">{title}</div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StatsView() {
  const { currentProfile } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    if (currentProfile) setWorkouts(getWorkouts(currentProfile.profileId));
  }, [currentProfile]);

  const volData      = useMemo(() => buildVolumeByDay(workouts), [workouts]);
  const topEx        = useMemo(() => buildTopExercises(workouts), [workouts]);
  const muscleFreq   = useMemo(() => buildMuscleFreq(workouts), [workouts]);
  const prs          = useMemo(() => buildPRs(workouts), [workouts]);
  const streak       = useMemo(() => workoutStreak(workouts), [workouts]);
  const week         = useMemo(() => thisWeekCount(workouts), [workouts]);
  const totalVol     = useMemo(
    () => Math.round(workouts.reduce((s, w) => s + vol(w), 0)),
    [workouts],
  );
  const volTrend = useMemo(
    () => volData.slice(-7).reduce((s, d) => s + d.volume, 0) -
          volData.slice(-14, -7).reduce((s, d) => s + d.volume, 0),
    [volData],
  );

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!workouts.length) {
    return (
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{
          width: 74, height: 74, borderRadius: 22,
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand)',
        }}>
          <TrendingUp size={34} strokeWidth={1.8} />
        </div>
        <div className="gt-display" style={{ fontSize: 26, marginTop: 18, color: 'var(--t1)' }}>
          NO NUMBERS YET
        </div>
        <div style={{ color: 'var(--t2)', fontSize: 14, marginTop: 8, maxWidth: 240, lineHeight: 1.55 }}>
          Log your first set and your scoreboard lights up.
        </div>
      </div>
    );
  }

  const trendPositive = volTrend >= 0;
  const trendLabel = (trendPositive ? '+' : '') + (volTrend / 1000).toFixed(1) + 'k';

  return (
    <div style={{ padding: '8px 18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <div className="gt-eyebrow">Your numbers</div>
        <div className="gt-display" style={{ fontSize: 32, marginTop: 4, color: 'var(--t1)' }}>
          SCOREBOARD
        </div>
      </div>

      {/* Score cards */}
      <div style={{ display: 'flex', gap: 10 }}>
        <ScoreCard Icon={Calendar}    value={week}   unit="/7"  label="Sessions this week" accent="var(--brand)" />
        <ScoreCard Icon={Flame}       value={streak} unit="d"   label="Current streak"     accent="var(--orange)" />
        <ScoreCard
          Icon={TrendingUp}
          value={totalVol >= 1000 ? (totalVol / 1000).toFixed(1) + 'k' : totalVol}
          unit="kg"
          label="Total volume"
          accent="var(--red)"
        />
      </div>

      {/* Volume chart */}
      <Panel
        title="Daily volume · 14 days"
        right={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
            color: trendPositive ? 'var(--brand)' : 'var(--orange)',
          }}>
            {trendPositive
              ? <ArrowUp size={13} strokeWidth={2.5} />
              : <ArrowDown size={13} strokeWidth={2.5} />}
            {trendLabel}
          </div>
        }
      >
        <VolumeChart data={volData} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {volData.filter((_, i) => i % 3 === 0).map((d, i) => (
            <span key={i} style={{
              fontSize: 9.5, color: 'var(--t3)', fontFamily: 'var(--font-mono)',
            }}>{d.date}</span>
          ))}
        </div>
      </Panel>

      {/* Top exercises */}
      {topEx.length > 0 && (
        <Panel title="Top exercises · volume">
          {topEx.map(e => (
            <BarRow key={e.name} label={e.name} value={e.volume} max={topEx[0].volume} />
          ))}
        </Panel>
      )}

      {/* Muscle frequency */}
      {muscleFreq.length > 0 && (
        <Panel title="Muscle frequency · sets">
          {muscleFreq.map(m => (
            <BarRow
              key={m.muscle}
              label={m.muscle}
              value={m.count}
              max={muscleFreq[0].count}
              color="linear-gradient(90deg, #c2410c, var(--orange))"
            />
          ))}
        </Panel>
      )}

      {/* PR trophy case */}
      {prs.length > 0 && (
        <Panel title="Personal records">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prs.map((pr, i) => {
              const gold = i === 0;
              return (
                <div key={pr.exercise} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: gold ? '14px 14px' : '10px 12px',
                  borderRadius: 16,
                  background: gold
                    ? 'linear-gradient(100deg, rgba(251,191,36,0.16), rgba(251,146,60,0.05))'
                    : 'var(--surface-2)',
                  border: '1px solid ' + (gold ? 'rgba(251,191,36,0.4)' : 'var(--border)'),
                }}>
                  {/* Rank tile */}
                  <div style={{
                    width: gold ? 38 : 28, height: gold ? 38 : 28, flexShrink: 0,
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: gold ? '#fbbf24' : 'transparent',
                    color: gold ? '#0a0c10' : 'var(--t3)',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: gold ? 16 : 14,
                  }}>
                    {gold ? <Trophy size={20} strokeWidth={2} /> : i + 1}
                  </div>

                  {/* Name + label */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: 'var(--t1)', fontSize: gold ? 15.5 : 14,
                      fontWeight: gold ? 700 : 600,
                    }}>{pr.exercise}</div>
                    {gold && (
                      <div style={{
                        fontSize: 11, color: '#fbbf24', fontWeight: 600, marginTop: 2,
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                      }}>HEAVIEST LIFT</div>
                    )}
                  </div>

                  {/* Weight + reps */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: gold ? 28 : 22, lineHeight: 1,
                      letterSpacing: 'var(--display-ls)', color: 'var(--t1)',
                    }}>{pr.weight}</span>
                    <span style={{
                      fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-mono)',
                    }}>kg×{pr.reps}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
