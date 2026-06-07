"use client";
import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Edit2, Check, X, Plus, Minus, Dumbbell, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts, updateWorkout, deleteWorkout } from '@/lib/storage';

function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function relDay(dateStr) {
  const today = ymd(new Date());
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yesterday = ymd(yd);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' });
}

function volW(w) { return w.sets.reduce((s, x) => s + x.weight * x.reps, 0); }

function NumField({ value, onChange, placeholder, unit }) {
  return (
    <div className="flex items-center gap-1 flex-1 bg-surface-2 rounded-[10px] px-[10px] py-2 border border-border-strong">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none text-t1 font-bold text-[15px] w-0 font-display text-center tracking-[var(--display-ls)]"
      />
      <span className="text-[10.5px] text-t3 font-mono shrink-0">{unit}</span>
    </div>
  );
}

export default function WorkoutHistory() {
  const { currentProfile } = useAuth();
  const [workouts, setWorkouts]     = useState([]);
  const [search, setSearch]         = useState('');
  const [editId, setEditId]         = useState(null);
  const [editSets, setEditSets]     = useState([]);
  const [confirmId, setConfirmId]   = useState(null);

  useEffect(() => {
    if (currentProfile) setWorkouts(getWorkouts(currentProfile.profileId));
  }, [currentProfile]);

  const filtered = workouts.filter(w =>
    w.exerciseName.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(w => { (g[w.date] = g[w.date] || []).push(w); });
    return g;
  }, [filtered]);

  const dates = useMemo(
    () => Object.keys(grouped).sort().reverse(),
    [grouped],
  );

  function startEdit(w) {
    setEditId(w.id);
    setEditSets(w.sets.map(s => ({ weight: String(s.weight), reps: String(s.reps) })));
    setConfirmId(null);
  }

  function saveEdit(workoutId) {
    const valid = editSets.filter(s => s.weight && s.reps && !isNaN(s.weight) && !isNaN(s.reps));
    if (!valid.length) return;
    const updated = updateWorkout(currentProfile.profileId, workoutId, {
      sets: valid.map((s, i) => ({
        setNumber: i + 1,
        weight: parseFloat(s.weight),
        reps: parseInt(s.reps),
      })),
    });
    setWorkouts(updated);
    setEditId(null);
  }

  function updES(i, f, v) {
    setEditSets(s => s.map((x, j) => j === i ? { ...x, [f]: v } : x));
  }

  function doDelete(workoutId) {
    const updated = deleteWorkout(currentProfile.profileId, workoutId);
    setWorkouts(updated);
    setConfirmId(null);
  }

  return (
    <div className="px-[18px] pt-2 flex flex-col gap-[14px]">

      <div>
        <div className="gt-eyebrow">Your training log</div>
        <div className="gt-display text-[32px] mt-1 text-t1">HISTORY</div>
      </div>

      <div className="relative">
        <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-t3 flex pointer-events-none">
          <Search size={18} />
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises…"
          className="w-full box-border py-[13px] pl-[44px] pr-4 rounded-[16px] bg-surface text-t1 text-[14.5px] border border-border-strong outline-none"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-t3 text-[14px] py-[50px]">
          {search ? 'No workouts match your search.' : 'No workouts logged yet.'}
        </div>
      )}

      {dates.map(date => {
        const dayWorkouts = grouped[date];
        const dayVol = dayWorkouts.reduce((s, w) => s + volW(w), 0);

        return (
          <div key={date} className="flex flex-col gap-[10px]">

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-[9px]">
                <span className="size-[7px] rounded-full bg-brand shrink-0" />
                <span className="font-display font-semibold text-[16px] uppercase tracking-[0.04em] text-t1">
                  {relDay(date)}
                </span>
              </div>
              <span className="text-[11px] font-mono text-t3">
                {dayWorkouts.length} · {Math.round(dayVol).toLocaleString()}kg
              </span>
            </div>

            {dayWorkouts.map(w => {
              const editing = editId === w.id;
              return (
                <div
                  key={w.id}
                  className={`rounded-[18px] overflow-hidden border bg-surface transition-[border-color,box-shadow] duration-150 ${
                    editing
                      ? 'border-brand shadow-[0_0_0_3px_var(--brand-glow)]'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between px-[15px] pt-[13px] pb-2">
                    <div className="flex items-center gap-[11px]">
                      <div className="size-9 rounded-[11px] shrink-0 bg-surface-2 flex items-center justify-center text-brand">
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <div className="text-t1 font-bold text-[15.5px]">{w.exerciseName}</div>
                        <div className="text-[10.5px] font-mono text-t3 mt-[2px]">
                          {w.category} · {w.sets.length} sets
                        </div>
                      </div>
                    </div>

                    {!editing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(w)}
                          className="size-8 rounded-[9px] cursor-pointer border-0 bg-transparent text-t3 flex items-center justify-center"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmId(w.id)}
                          className="size-8 rounded-[9px] cursor-pointer border-0 bg-transparent text-t3 flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {confirmId === w.id && (
                    <div className="mx-[15px] mb-3 px-[13px] py-[11px] rounded-[13px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.35)] flex items-center justify-between gap-[10px]">
                      <span className="text-[#fca5a5] text-[13px] font-semibold">Delete this entry?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[12.5px] text-t2 bg-transparent border-0 cursor-pointer px-2 py-[5px]"
                        >Cancel</button>
                        <button
                          onClick={() => doDelete(w.id)}
                          className="text-[12.5px] font-bold text-white bg-red border-0 cursor-pointer px-3 py-[6px] rounded-[9px]"
                        >Delete</button>
                      </div>
                    </div>
                  )}

                  {!editing && (
                    <div className="px-[15px] pb-[13px]">
                      <div className="flex flex-wrap gap-[6px] mb-[9px]">
                        {w.sets.map((s, i) => (
                          <span key={i} className="text-[12px] font-mono text-t2 bg-surface-2 rounded-[8px] px-[9px] py-[6px]">
                            <span className="text-t3">{i + 1}</span>
                            {' '}{s.weight}<span className="text-t3">kg</span> × {s.reps}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-[7px] pt-[9px] border-t border-border">
                        <Layers size={14} className="text-brand shrink-0" />
                        <span className="text-[12px] text-t2">Volume</span>
                        <span className="ml-auto font-display font-bold text-[17px] text-brand tabular-nums tracking-[var(--display-ls)]">
                          {volW(w).toLocaleString()}{' '}
                          <span className="text-[11px] text-t3">kg</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {editing && (
                    <div className="px-[15px] pb-[14px] flex flex-col gap-[9px]">
                      {editSets.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 font-display font-bold text-brand text-[15px] shrink-0 text-center">{i + 1}</span>
                          <NumField value={s.weight} onChange={v => updES(i, 'weight', v)} placeholder="0" unit="kg" />
                          <span className="text-t3 shrink-0">×</span>
                          <NumField value={s.reps} onChange={v => updES(i, 'reps', v)} placeholder="0" unit="reps" />
                          <button
                            onClick={() => editSets.length > 1 && setEditSets(s => s.filter((_, j) => j !== i))}
                            className="w-[26px] bg-transparent border-0 cursor-pointer text-t3 shrink-0 flex items-center justify-center"
                          >
                            <Minus size={17} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => setEditSets(s => [...s, { weight: '', reps: '' }])}
                        className="self-start flex items-center gap-[5px] bg-transparent border-0 cursor-pointer text-brand text-[12.5px] font-bold"
                      >
                        <Plus size={14} /> Add set
                      </button>

                      <div className="flex gap-[9px] mt-[2px]">
                        <button
                          onClick={() => setEditId(null)}
                          className="flex-1 py-3 rounded-[13px] cursor-pointer border border-border-strong bg-transparent text-t2 font-semibold text-[13.5px] flex items-center justify-center gap-[6px]"
                        >
                          <X size={16} /> Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(w.id)}
                          className="flex-1 py-3 rounded-[13px] cursor-pointer border-0 bg-brand text-[#0a0c10] font-bold text-[13.5px] flex items-center justify-center gap-[6px]"
                        >
                          <Check size={16} strokeWidth={2.6} /> Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="h-2" />
    </div>
  );
}
