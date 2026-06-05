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

// ── Sub-components ─────────────────────────────────────────────────────────
function NumField({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box', textAlign: 'center',
          padding: '14px 10px', borderRadius: 14,
          background: 'var(--surface)', color: 'var(--t1)',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 22, letterSpacing: '0.01em',
          border: '1px solid var(--border-strong)', outline: 'none',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      {unit && (
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-mono)', pointerEvents: 'none',
        }}>{unit}</span>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onMouseDown={onClick}
      style={{
        flexShrink: 0, padding: '9px 15px', borderRadius: 999,
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer', whiteSpace: 'nowrap',
        border: '1px solid ' + (active ? 'transparent' : 'var(--border)'),
        background: active ? 'var(--brand)' : 'transparent',
        color: active ? '#0a0c10' : 'var(--t2)',
        transition: 'all .15s',
      }}
    >{children}</button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
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

  // Slide-up entrance animation
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
    /* Overlay */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        display: 'flex', alignItems: 'flex-end',
        background: shown ? 'rgba(2,4,8,0.62)' : 'rgba(2,4,8,0)',
        backdropFilter: shown ? 'blur(2px)' : 'none',
        transition: 'background .3s, backdrop-filter .3s',
      }}
      onClick={handleClose}
    >
      {/* Sheet panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '92%',
          background: 'var(--sheet)', borderRadius: '28px 28px 0 0',
          overflow: 'hidden', boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border)', borderBottom: 'none',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .34s cubic-bezier(.16,1,.3,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 12px', flexShrink: 0,
        }}>
          <div>
            <div className="gt-eyebrow">Log session</div>
            <div className="gt-display" style={{ fontSize: 25, marginTop: 3, color: 'var(--t1)' }}>
              NEW WORKOUT
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--t2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="gt-scroll"
          style={{ overflowY: 'auto', padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          {/* Suggested chips */}
          {preselectedMuscle && suggested.length > 0 && !ex && (
            <div>
              <div className="gt-eyebrow" style={{ marginBottom: 9 }}>
                Suggested · {MUSCLE_LABELS[preselectedMuscle] || preselectedMuscle.replace(/-/g, ' ')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggested.map(e => (
                  <button
                    key={e.id}
                    onClick={() => pick(e)}
                    style={{
                      padding: '10px 14px', borderRadius: 999, cursor: 'pointer',
                      border: '1px solid var(--brand)', background: 'var(--brand-glow)',
                      color: 'var(--brand)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    }}
                  >{e.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Exercise search */}
          <div>
            <div className="gt-eyebrow" style={{ marginBottom: 9 }}>Exercise</div>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--t3)', display: 'flex', pointerEvents: 'none',
              }}>
                <Search size={18} />
              </span>
              <input
                value={query}
                onFocus={() => setOpen(true)}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) setEx(null); }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Search exercises…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 16px 14px 44px', borderRadius: 16,
                  background: 'var(--surface)', color: 'var(--t1)',
                  fontSize: 15, fontFamily: 'inherit',
                  border: '1px solid ' + (ex ? 'var(--brand)' : 'var(--border-strong)'),
                  outline: 'none',
                }}
              />
            </div>

            {/* Category chips */}
            {open && !query.trim() && (
              <div
                className="gt-scroll"
                style={{ display: 'flex', gap: 7, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}
              >
                {['All', ...EXERCISE_CATEGORIES].map(c => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
                ))}
              </div>
            )}

            {/* Exercise dropdown */}
            {open && (
              <div style={{
                marginTop: 10, borderRadius: 16, border: '1px solid var(--border)',
                background: 'var(--surface)', overflow: 'hidden', maxHeight: 230, overflowY: 'auto',
              }}>
                {list.slice(0, 30).map(e => (
                  <button
                    key={e.id}
                    onMouseDown={() => pick(e)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      padding: '12px 16px', background: 'transparent', border: 'none',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: 'var(--t1)', fontSize: 14.5, fontWeight: 600 }}>{e.name}</div>
                      <div style={{ color: 'var(--t3)', fontSize: 11.5, marginTop: 2 }}>
                        {e.primaryMuscles.map(m => MUSCLE_LABELS[m] || m).join(' · ')}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--t3)',
                      border: '1px solid var(--border-strong)', borderRadius: 6,
                      padding: '3px 7px', flexShrink: 0, marginLeft: 8,
                    }}>{e.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sets */}
          {ex && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="gt-eyebrow">Sets · {ex.name}</div>
                <button
                  onClick={() => setSets(s => [...s, { weight: '', reps: '' }])}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--brand)', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} /> Add set
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {sets.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 34, height: 34, flexShrink: 0, borderRadius: 10,
                      background: 'var(--surface-2)', color: 'var(--brand)',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                      letterSpacing: 'var(--display-ls)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</div>
                    <NumField value={s.weight} onChange={v => upd(i, 'weight', v)} placeholder="0" unit="kg" />
                    <span style={{ color: 'var(--t3)', fontSize: 14, flexShrink: 0 }}>×</span>
                    <NumField value={s.reps} onChange={v => upd(i, 'reps', v)} placeholder="0" unit="reps" />
                    <button
                      onClick={() => sets.length > 1 && setSets(s => s.filter((_, j) => j !== i))}
                      style={{
                        width: 30, flexShrink: 0, background: 'none', border: 'none',
                        cursor: 'pointer',
                        color: sets.length > 1 ? 'var(--t3)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && (
            <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{err}</div>
          )}

          <div style={{ height: 4 }} />
        </div>

        {/* Sticky footer */}
        <div style={{
          padding: '14px 20px calc(18px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          background: 'var(--sheet)',
          display: 'flex', flexDirection: 'column', gap: 12,
          flexShrink: 0,
        }}>
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="gt-eyebrow">Total volume</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 26, lineHeight: 0.9, letterSpacing: 'var(--display-ls)',
                  color: 'var(--brand)', fontVariantNumeric: 'tabular-nums',
                }}>{total.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>kg</span>
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saved}
            style={{
              width: '100%', padding: '17px', borderRadius: 18, cursor: 'pointer',
              border: 'none',
              background: saved ? 'var(--brand-deep)' : 'var(--brand)',
              color: '#0a0c10',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 19, letterSpacing: 'var(--display-ls)',
              textTransform: 'uppercase',
              boxShadow: '0 10px 30px var(--brand-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              transition: 'background .2s',
            }}
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
