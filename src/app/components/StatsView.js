"use client";
import { useState, useEffect, useMemo } from 'react';
import { Flame, Calendar, TrendingUp, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts } from '@/lib/storage';

function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function todayYmd() { return ymd(new Date()); }
function fmtDate(ds) {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

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
      className="block overflow-visible"
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
    <div className="flex items-center gap-3 py-[7px]">
      <div className="w-24 text-[12.5px] text-t2 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">{label}</div>
      <div className="flex-1 h-[10px] rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: Math.max(4, (value / max) * 100) + '%',
            background: color || 'linear-gradient(90deg, var(--brand-deep), var(--brand))',
          }}
        />
      </div>
      <div className="w-[52px] text-right font-mono text-[11.5px] text-t1 shrink-0">{value.toLocaleString()}</div>
    </div>
  );
}

function ScoreCard({ Icon: IconComp, value, unit, label, accent }) {
  return (
    <div className="flex-1 rounded-[18px] p-[14px_13px] relative overflow-hidden bg-surface border border-border">
      <div
        className="absolute -top-4 -right-4 size-[60px] rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}33, transparent 70%)` }}
      />
      <span className="flex" style={{ color: accent }}>
        <IconComp size={18} strokeWidth={2} />
      </span>
      <div className="mt-4 flex items-baseline gap-[3px]">
        <span className="font-display font-bold text-[36px] leading-none tracking-[var(--display-ls)] text-t1 tabular-nums">
          {value}
        </span>
        <span className="text-[11px] text-t3 font-mono">{unit}</span>
      </div>
      <div className="text-[11.5px] text-t2 mt-1">{label}</div>
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-[16px_16px_14px]">
      <div className="flex items-center justify-between mb-[14px]">
        <div className="gt-eyebrow">{title}</div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}

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

  if (!workouts.length) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="size-[74px] rounded-[22px] bg-surface border border-border flex items-center justify-center text-brand">
          <TrendingUp size={34} strokeWidth={1.8} />
        </div>
        <div className="gt-display text-[26px] mt-[18px] text-t1">NO NUMBERS YET</div>
        <div className="text-t2 text-[14px] mt-2 max-w-[240px] leading-[1.55]">
          Log your first set and your scoreboard lights up.
        </div>
      </div>
    );
  }

  const trendPositive = volTrend >= 0;
  const trendLabel = (trendPositive ? '+' : '') + (volTrend / 1000).toFixed(1) + 'k';

  return (
    <div className="px-[18px] pt-2 flex flex-col gap-4">

      <div>
        <div className="gt-eyebrow">Your numbers</div>
        <div className="gt-display text-[32px] mt-1 text-t1">SCOREBOARD</div>
      </div>

      <div className="flex gap-[10px]">
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

      <Panel
        title="Daily volume · 14 days"
        right={
          <div className={`flex items-center gap-1 text-[12px] font-bold ${trendPositive ? 'text-brand' : 'text-orange'}`}>
            {trendPositive
              ? <ArrowUp size={13} strokeWidth={2.5} />
              : <ArrowDown size={13} strokeWidth={2.5} />}
            {trendLabel}
          </div>
        }
      >
        <VolumeChart data={volData} />
        <div className="flex justify-between mt-2">
          {volData.filter((_, i) => i % 3 === 0).map((d, i) => (
            <span key={i} className="text-[9.5px] text-t3 font-mono">{d.date}</span>
          ))}
        </div>
      </Panel>

      {topEx.length > 0 && (
        <Panel title="Top exercises · volume">
          {topEx.map(e => (
            <BarRow key={e.name} label={e.name} value={e.volume} max={topEx[0].volume} />
          ))}
        </Panel>
      )}

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

      {prs.length > 0 && (
        <Panel title="Personal records">
          <div className="flex flex-col gap-2">
            {prs.map((pr, i) => {
              const gold = i === 0;
              return (
                <div
                  key={pr.exercise}
                  className={`flex items-center gap-3 rounded-[16px] border ${
                    gold
                      ? 'px-[14px] py-[14px] border-[rgba(251,191,36,0.4)]'
                      : 'px-3 py-[10px] bg-surface-2 border-border'
                  }`}
                  style={gold ? { background: 'linear-gradient(100deg, rgba(251,191,36,0.16), rgba(251,146,60,0.05))' } : undefined}
                >
                  <div className={`shrink-0 rounded-[10px] flex items-center justify-center font-display font-bold ${
                    gold
                      ? 'size-[38px] bg-amber text-[#0a0c10] text-[16px]'
                      : 'size-7 bg-transparent text-t3 text-[14px]'
                  }`}>
                    {gold ? <Trophy size={20} strokeWidth={2} /> : i + 1}
                  </div>

                  <div className="flex-1">
                    <div className={`text-t1 ${gold ? 'text-[15.5px] font-bold' : 'text-[14px] font-semibold'}`}>
                      {pr.exercise}
                    </div>
                    {gold && (
                      <div className="text-[11px] text-amber font-semibold mt-[2px] font-mono tracking-[0.05em]">
                        HEAVIEST LIFT
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={`font-display font-bold leading-none tracking-[var(--display-ls)] text-t1 ${gold ? 'text-[28px]' : 'text-[22px]'}`}>
                      {pr.weight}
                    </span>
                    <span className="text-[11px] text-t3 font-mono">kg×{pr.reps}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <div className="h-2" />
    </div>
  );
}
