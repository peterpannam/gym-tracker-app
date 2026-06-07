"use client";
import { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, Check, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { saveWorkout } from '@/lib/storage';
import { EXERCISES, EXERCISE_CATEGORIES, searchExercises, getExercisesForMuscle } from '@/lib/exercises';

const MUSCLE_LABELS = {
  chest: 'Chest', abs: 'Abs', shoulders: 'Shoulders', biceps: 'Biceps',
  forearms: 'Forearms', quads: 'Quads', calves: 'Calves', traps: 'Traps',
  lats: 'Lats', 'lower-back': 'Lower Back', triceps: 'Triceps',
  'rear-delts': 'Rear Delts', glutes: 'Glutes', hamstrings: 'Hamstrings',
};

function NumField({ value, onChange, placeholder, unit }) {
  return (
    <div className="flex-1 relative">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full box-border text-center px-[10px] py-[14px] rounded-[14px] bg-surface text-t1 font-display font-semibold text-[22px] tracking-[0.01em] border border-border-strong outline-none tabular-nums"
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-t3 font-mono pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onMouseDown={onClick}
      className={`shrink-0 px-[15px] py-[9px] rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 border ${
        active
          ? 'border-transparent bg-brand text-[#0a0c10]'
          : 'border-border bg-transparent text-t2'
      }`}
    >
      {children}
    </button>
  );
}

export default function WorkoutLogger({ onSave, onClose, preselectedMuscle }) {
  const { currentProfile } = useAuth();
  const [shown, setShown]   = useState(false);
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [ex, setEx]         = useState(null);
  const [cat, setCat]       = useState('All');
  const [sets, setSets]     = useState([{ weight: '', reps: '' }]);
  const [err, setErr]       = useState('');
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  function handleClose() {
    setShown(false);
    setTimeout(onClose, 340);
  }

  const suggested = preselectedMuscle
    ? getExercisesForMuscle(preselectedMuscle).slice(0, 6)
    : [];

  const list = query.trim()
    ? searchExercises(query)
    : cat === 'All' ? EXERCISES : EXERCISES.filter(e => e.category === cat);

  function pick(exercise) {
    setEx(exercise);
    setQuery(exercise.name);
    setOpen(false);
    setErr('');
  }

  function upd(i, f, v) {
    setSets(s => s.map((x, j) => j === i ? { ...x, [f]: v } : x));
  }

  const total = sets.reduce((s, x) => s + (parseFloat(x.weight || 0) * parseInt(x.reps || 0)), 0);

  function save() {
    setErr('');
    if (!ex) { setErr('Pick an exercise first'); return; }
    const valid = sets.filter(s => s.weight !== '' && s.reps !== '' && !isNaN(s.weight) && !isNaN(s.reps));
    if (!valid.length) { setErr('Add at least one complete set'); return; }
    saveWorkout(currentProfile.profileId, {
      exerciseName: ex.name,
      category: ex.category,
      sets: valid.map((s, i) => ({ setNumber: i + 1, weight: parseFloat(s.weight), reps: parseInt(s.reps) })),
      targetedMuscles: [...ex.primaryMuscles, ...ex.secondaryMuscles],
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEx(null);
      setQuery('');
      setSets([{ weight: '', reps: '' }]);
      if (onSave) onSave();
    }, 620);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end"
      style={{
        background: shown ? 'rgba(2,4,8,0.62)' : 'rgba(2,4,8,0)',
        backdropFilter: shown ? 'blur(2px)' : 'none',
        transition: 'background .3s, backdrop-filter .3s',
      }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-h-[92%] bg-sheet rounded-t-[28px] overflow-hidden border border-b-0 border-border flex flex-col"
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
        <div className="flex items-center justify-between px-5 pt-[14px] pb-3 shrink-0">
          <div>
            <div className="gt-eyebrow">Log session</div>
            <div className="gt-display text-[25px] mt-[3px] text-t1">NEW WORKOUT</div>
          </div>
          <button
            onClick={handleClose}
            className="size-[38px] rounded-[12px] cursor-pointer border border-border bg-surface text-t2 flex items-center justify-center"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="gt-scroll overflow-y-auto px-5 pt-1 flex flex-col gap-[18px]">

          {/* Suggested chips */}
          {preselectedMuscle && suggested.length > 0 && !ex && (
            <div>
              <div className="gt-eyebrow mb-[9px]">
                Suggested · {MUSCLE_LABELS[preselectedMuscle] || preselectedMuscle.replace(/-/g, ' ')}
              </div>
              <div className="flex flex-wrap gap-2">
                {suggested.map(e => (
                  <button
                    key={e.id}
                    onClick={() => pick(e)}
                    className="px-[14px] py-[10px] rounded-full cursor-pointer border border-brand text-brand text-[13px] font-semibold"
                    style={{ background: 'var(--brand-glow)' }}
                  >{e.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Exercise search */}
          <div>
            <div className="gt-eyebrow mb-[9px]">Exercise</div>
            <div className="relative">
              <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-t3 flex pointer-events-none">
                <Search size={18} />
              </span>
              <input
                value={query}
                onFocus={() => setOpen(true)}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) setEx(null); }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Search exercises…"
                className={`w-full box-border py-[14px] pl-[44px] pr-4 rounded-[16px] bg-surface text-t1 text-[15px] outline-none border ${ex ? 'border-brand' : 'border-border-strong'}`}
              />
            </div>

            {/* Category chips */}
            {open && !query.trim() && (
              <div className="gt-scroll flex gap-[7px] mt-[10px] overflow-x-auto pb-[2px]">
                {['All', ...EXERCISE_CATEGORIES].map(c => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
                ))}
              </div>
            )}

            {/* Exercise dropdown */}
            {open && (
              <div className="mt-[10px] rounded-[16px] border border-border bg-surface overflow-hidden max-h-[230px] overflow-y-auto">
                {list.slice(0, 30).map(e => (
                  <button
                    key={e.id}
                    onMouseDown={() => pick(e)}
                    className="w-full text-left cursor-pointer px-4 py-3 bg-transparent border-0 border-b border-border flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-t1 text-[14.5px] font-semibold">{e.name}</div>
                      <div className="text-t3 text-[11.5px] mt-[2px]">
                        {e.primaryMuscles.map(m => MUSCLE_LABELS[m] || m).join(' · ')}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-t3 border border-border-strong rounded-[6px] px-[7px] py-[3px] shrink-0 ml-2">
                      {e.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sets */}
          {ex && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="gt-eyebrow">Sets · {ex.name}</div>
                <button
                  onClick={() => setSets(s => [...s, { weight: '', reps: '' }])}
                  className="flex items-center gap-[5px] bg-transparent border-0 cursor-pointer text-brand text-[12.5px] font-bold"
                >
                  <Plus size={15} strokeWidth={2.5} /> Add set
                </button>
              </div>
              <div className="flex flex-col gap-[9px]">
                {sets.map((s, i) => (
                  <div key={i} className="flex items-center gap-[9px]">
                    <div className="size-[34px] shrink-0 rounded-[10px] bg-surface-2 text-brand font-display font-bold text-[16px] tracking-[var(--display-ls)] flex items-center justify-center">
                      {i + 1}
                    </div>
                    <NumField value={s.weight} onChange={v => upd(i, 'weight', v)} placeholder="0" unit="kg" />
                    <span className="text-t3 text-[14px] shrink-0">×</span>
                    <NumField value={s.reps} onChange={v => upd(i, 'reps', v)} placeholder="0" unit="reps" />
                    <button
                      onClick={() => sets.length > 1 && setSets(s => s.filter((_, j) => j !== i))}
                      className={`w-[30px] shrink-0 bg-transparent border-0 cursor-pointer flex items-center justify-center ${sets.length > 1 ? 'text-t3' : 'text-transparent'}`}
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && <div className="text-red text-[13px] font-semibold">{err}</div>}
          <div className="h-1" />
        </div>

        {/* Sticky footer */}
        <div
          className="px-5 border-t border-border bg-sheet flex flex-col gap-3 shrink-0"
          style={{ padding: '14px 20px calc(18px + env(safe-area-inset-bottom))' }}
        >
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="gt-eyebrow">Total volume</div>
              <div className="flex items-baseline gap-[5px]">
                <span className="font-display font-bold text-[26px] leading-none tracking-[var(--display-ls)] text-brand tabular-nums">
                  {total.toLocaleString()}
                </span>
                <span className="text-[12px] text-t3 font-mono">kg</span>
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saved}
            className={`w-full py-[17px] rounded-[18px] cursor-pointer border-0 text-[#0a0c10] font-display font-bold text-[19px] tracking-[var(--display-ls)] uppercase flex items-center justify-center gap-[9px] transition-colors duration-200 ${saved ? 'bg-brand-deep' : 'bg-brand'}`}
            style={{ boxShadow: '0 10px 30px var(--brand-glow)' }}
          >
            {saved
              ? <><Check size={21} strokeWidth={2.6} /> Saved</>
              : <>Save workout <Zap size={19} fill="#0a0c10" strokeWidth={0} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
