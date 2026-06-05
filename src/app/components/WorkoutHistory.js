"use client";
import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Edit2, Check, X, Plus, Minus, Dumbbell, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkouts, updateWorkout, deleteWorkout } from '@/lib/storage';

// ── Local date helpers ─────────────────────────────────────────────────────
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

// ── Sub-components ─────────────────────────────────────────────────────────
function NumField({ value, onChange, placeholder, unit }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, flex: 1,
      background: 'var(--surface-2)', borderRadius: 10, padding: '8px 10px',
      border: '1px solid var(--border-strong)',
    }}>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--t1)', fontWeight: 700, fontSize: 15,
          width: 0, fontFamily: 'var(--font-display)',
          textAlign: 'center', letterSpacing: 'var(--display-ls)',
        }}
      />
      <span style={{ fontSize: 10.5, color: 'var(--t3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
        {unit}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
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

  // ── Edit logic ─────────────────────────────────────────────────────────
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

  // ── Delete logic ───────────────────────────────────────────────────────
  function doDelete(workoutId) {
    const updated = deleteWorkout(currentProfile.profileId, workoutId);
    setWorkouts(updated);
    setConfirmId(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '8px 18px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div>
        <div className="gt-eyebrow">Your training log</div>
        <div className="gt-display" style={{ fontSize: 32, marginTop: 4, color: 'var(--t1)' }}>
          HISTORY
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--t3)', display: 'flex', pointerEvents: 'none',
        }}>
          <Search size={18} />
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '13px 16px 13px 44px', borderRadius: 16,
            background: 'var(--surface)', color: 'var(--t1)',
            fontSize: 14.5, fontFamily: 'inherit',
            border: '1px solid var(--border-strong)', outline: 'none',
          }}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 14, padding: '50px 0' }}>
          {search ? 'No workouts match your search.' : 'No workouts logged yet.'}
        </div>
      )}

      {/* Date groups */}
      {dates.map(date => {
        const dayWorkouts = grouped[date];
        const dayVol = dayWorkouts.reduce((s, w) => s + volW(w), 0);

        return (
          <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                  textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t1)',
                }}>{relDay(date)}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--t3)' }}>
                {dayWorkouts.length} · {Math.round(dayVol).toLocaleString()}kg
              </span>
            </div>

            {/* Workout cards */}
            {dayWorkouts.map(w => {
              const editing = editId === w.id;
              return (
                <div key={w.id} style={{
                  borderRadius: 18, overflow: 'hidden',
                  border: '1px solid ' + (editing ? 'var(--brand)' : 'var(--border)'),
                  background: 'var(--surface)',
                  boxShadow: editing ? '0 0 0 3px var(--brand-glow)' : 'none',
                  transition: 'border-color .15s, box-shadow .15s',
                }}>

                  {/* Card header */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', padding: '13px 15px 8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                        background: 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--brand)',
                      }}>
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <div style={{ color: 'var(--t1)', fontWeight: 700, fontSize: 15.5 }}>
                          {w.exerciseName}
                        </div>
                        <div style={{
                          fontSize: 10.5, fontFamily: 'var(--font-mono)',
                          color: 'var(--t3)', marginTop: 2,
                        }}>
                          {w.category} · {w.sets.length} sets
                        </div>
                      </div>
                    </div>

                    {!editing && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => startEdit(w)}
                          style={{
                            width: 32, height: 32, borderRadius: 9, cursor: 'pointer',
                            border: 'none', background: 'transparent', color: 'var(--t3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmId(w.id)}
                          style={{
                            width: 32, height: 32, borderRadius: 9, cursor: 'pointer',
                            border: 'none', background: 'transparent', color: 'var(--t3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Delete confirm */}
                  {confirmId === w.id && (
                    <div style={{
                      margin: '0 15px 12px', padding: '11px 13px', borderRadius: 13,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    }}>
                      <span style={{ color: '#fca5a5', fontSize: 13, fontWeight: 600 }}>Delete this entry?</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{
                            fontSize: 12.5, color: 'var(--t2)', background: 'none',
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '5px 8px',
                          }}
                        >Cancel</button>
                        <button
                          onClick={() => doDelete(w.id)}
                          style={{
                            fontSize: 12.5, fontWeight: 700, color: '#fff',
                            background: 'var(--red)', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', padding: '6px 12px', borderRadius: 9,
                          }}
                        >Delete</button>
                      </div>
                    </div>
                  )}

                  {/* View mode */}
                  {!editing && (
                    <div style={{ padding: '0 15px 13px' }}>
                      {/* Set chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 9 }}>
                        {w.sets.map((s, i) => (
                          <span key={i} style={{
                            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--t2)',
                            background: 'var(--surface-2)', borderRadius: 8, padding: '6px 9px',
                          }}>
                            <span style={{ color: 'var(--t3)' }}>{i + 1}</span>
                            {' '}{s.weight}<span style={{ color: 'var(--t3)' }}>kg</span> × {s.reps}
                          </span>
                        ))}
                      </div>

                      {/* Volume footer */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        paddingTop: 9, borderTop: '1px solid var(--border)',
                      }}>
                        <Layers size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>Volume</span>
                        <span style={{
                          marginLeft: 'auto',
                          fontFamily: 'var(--font-display)', fontWeight: 700,
                          fontSize: 17, color: 'var(--brand)',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: 'var(--display-ls)',
                        }}>
                          {volW(w).toLocaleString()}{' '}
                          <span style={{ fontSize: 11, color: 'var(--t3)' }}>kg</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Edit mode */}
                  {editing && (
                    <div style={{ padding: '0 15px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {editSets.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 24, fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: 'var(--brand)', fontSize: 15, flexShrink: 0, textAlign: 'center',
                          }}>{i + 1}</span>
                          <NumField value={s.weight} onChange={v => updES(i, 'weight', v)} placeholder="0" unit="kg" />
                          <span style={{ color: 'var(--t3)', flexShrink: 0 }}>×</span>
                          <NumField value={s.reps} onChange={v => updES(i, 'reps', v)} placeholder="0" unit="reps" />
                          <button
                            onClick={() => editSets.length > 1 && setEditSets(s => s.filter((_, j) => j !== i))}
                            style={{
                              width: 26, background: 'none', border: 'none',
                              cursor: 'pointer', color: 'var(--t3)', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Minus size={17} />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => setEditSets(s => [...s, { weight: '', reps: '' }])}
                        style={{
                          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--brand)', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
                        }}
                      >
                        <Plus size={14} /> Add set
                      </button>

                      <div style={{ display: 'flex', gap: 9, marginTop: 2 }}>
                        <button
                          onClick={() => setEditId(null)}
                          style={{
                            flex: 1, padding: '12px', borderRadius: 13, cursor: 'pointer',
                            border: '1px solid var(--border-strong)', background: 'transparent',
                            color: 'var(--t2)', fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                        >
                          <X size={16} /> Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(w.id)}
                          style={{
                            flex: 1, padding: '12px', borderRadius: 13, cursor: 'pointer',
                            border: 'none', background: 'var(--brand)', color: '#0a0c10',
                            fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
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

      <div style={{ height: 8 }} />
    </div>
  );
}
