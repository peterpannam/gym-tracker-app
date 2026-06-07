export const EXERCISE_CATEGORIES = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']

export const MUSCLE_LABELS = {
  chest: 'Chest', abs: 'Abs', shoulders: 'Shoulders', biceps: 'Biceps',
  forearms: 'Forearms', quads: 'Quads', calves: 'Calves', traps: 'Traps',
  lats: 'Lats', 'lower-back': 'Lower Back', triceps: 'Triceps',
  'rear-delts': 'Rear Delts', glutes: 'Glutes', hamstrings: 'Hamstrings',
}

export const EXERCISES = [
  // CHEST
  { id: 'bench-press', name: 'Bench Press', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'] },
  { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders', 'triceps'] },
  { id: 'decline-bench-press', name: 'Decline Bench Press', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'] },
  { id: 'dumbbell-flyes', name: 'Dumbbell Flyes', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: [] },
  { id: 'cable-crossover', name: 'Cable Crossover', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: [] },
  { id: 'push-up', name: 'Push-Up', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'] },
  { id: 'chest-dip', name: 'Chest Dip', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'] },
  { id: 'pec-deck', name: 'Pec Deck', category: 'Chest', primaryMuscles: ['chest'], secondaryMuscles: [] },

  // BACK
  { id: 'deadlift', name: 'Deadlift', category: 'Back', primaryMuscles: ['hamstrings', 'glutes', 'lower-back'], secondaryMuscles: ['traps', 'lats'] },
  { id: 'pull-up', name: 'Pull-Up', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['biceps', 'rear-delts'] },
  { id: 'chin-up', name: 'Chin-Up', category: 'Back', primaryMuscles: ['lats', 'biceps'], secondaryMuscles: ['rear-delts'] },
  { id: 'barbell-row', name: 'Barbell Row', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['traps', 'rear-delts', 'biceps'] },
  { id: 'dumbbell-row', name: 'Dumbbell Row', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['traps', 'rear-delts', 'biceps'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['biceps', 'rear-delts'] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['traps', 'rear-delts', 'biceps'] },
  { id: 'face-pull', name: 'Face Pull', category: 'Back', primaryMuscles: ['rear-delts', 'traps'], secondaryMuscles: [] },
  { id: 'shrugs', name: 'Shrugs', category: 'Back', primaryMuscles: ['traps'], secondaryMuscles: [] },
  { id: 'hyperextension', name: 'Hyperextension', category: 'Back', primaryMuscles: ['lower-back', 'glutes'], secondaryMuscles: ['hamstrings'] },
  { id: 'good-morning', name: 'Good Morning', category: 'Back', primaryMuscles: ['lower-back', 'hamstrings'], secondaryMuscles: ['glutes'] },
  { id: 'tbar-row', name: 'T-Bar Row', category: 'Back', primaryMuscles: ['lats'], secondaryMuscles: ['traps', 'rear-delts'] },

  // SHOULDERS
  { id: 'overhead-press', name: 'Overhead Press', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps', 'traps'] },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'] },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: [] },
  { id: 'front-raise', name: 'Front Raise', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: [] },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'] },
  { id: 'upright-row', name: 'Upright Row', category: 'Shoulders', primaryMuscles: ['shoulders', 'traps'], secondaryMuscles: ['biceps'] },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', category: 'Shoulders', primaryMuscles: ['shoulders'], secondaryMuscles: [] },

  // ARMS — Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: ['forearms'] },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: ['forearms'] },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'Arms', primaryMuscles: ['biceps', 'forearms'], secondaryMuscles: [] },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: [] },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: [] },
  { id: 'cable-curl', name: 'Cable Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: [] },
  { id: 'concentration-curl', name: 'Concentration Curl', category: 'Arms', primaryMuscles: ['biceps'], secondaryMuscles: [] },

  // ARMS — Triceps
  { id: 'tricep-dip', name: 'Tricep Dip', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: ['chest', 'shoulders'] },
  { id: 'skull-crusher', name: 'Skull Crusher', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: [] },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: [] },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: [] },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'] },
  { id: 'diamond-push-up', name: 'Diamond Push-Up', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'] },
  { id: 'kickback', name: 'Tricep Kickback', category: 'Arms', primaryMuscles: ['triceps'], secondaryMuscles: [] },

  // ARMS — Forearms
  { id: 'wrist-curl', name: 'Wrist Curl', category: 'Arms', primaryMuscles: ['forearms'], secondaryMuscles: [] },
  { id: 'reverse-curl', name: 'Reverse Curl', category: 'Arms', primaryMuscles: ['forearms', 'biceps'], secondaryMuscles: [] },
  { id: 'farmers-carry', name: "Farmer's Carry", category: 'Arms', primaryMuscles: ['forearms'], secondaryMuscles: ['traps'] },

  // LEGS
  { id: 'squat', name: 'Squat', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'calves'] },
  { id: 'front-squat', name: 'Front Squat', category: 'Legs', primaryMuscles: ['quads'], secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'calves'] },
  { id: 'lunge', name: 'Lunge', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'calves'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower-back'] },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs', primaryMuscles: ['hamstrings'], secondaryMuscles: [] },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs', primaryMuscles: ['quads'], secondaryMuscles: [] },
  { id: 'calf-raise', name: 'Calf Raise', category: 'Legs', primaryMuscles: ['calves'], secondaryMuscles: [] },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'Legs', primaryMuscles: ['calves'], secondaryMuscles: [] },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'Legs', primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings'] },
  { id: 'sumo-squat', name: 'Sumo Squat', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'calves'] },
  { id: 'hack-squat', name: 'Hack Squat', category: 'Legs', primaryMuscles: ['quads'], secondaryMuscles: ['glutes'] },
  { id: 'step-up', name: 'Step-Up', category: 'Legs', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['calves'] },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', category: 'Legs', primaryMuscles: ['glutes', 'quads'], secondaryMuscles: ['hamstrings', 'lower-back'] },

  // CORE
  { id: 'plank', name: 'Plank', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'crunch', name: 'Crunch', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'sit-up', name: 'Sit-Up', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'leg-raise', name: 'Leg Raise', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
  { id: 'side-plank', name: 'Side Plank', category: 'Core', primaryMuscles: ['abs'], secondaryMuscles: [] },
]

export function searchExercises(query) {
  if (!query.trim()) return EXERCISES
  const q = query.toLowerCase()
  return EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.category.toLowerCase().includes(q) ||
    ex.primaryMuscles.some(m => m.includes(q)) ||
    ex.secondaryMuscles.some(m => m.includes(q))
  )
}

export function getExercisesByCategory(category) {
  return EXERCISES.filter(ex => ex.category === category)
}

export function getExerciseById(id) {
  return EXERCISES.find(ex => ex.id === id) || null
}

export function getExercisesForMuscle(muscleId) {
  const baseId = muscleId.replace('-left', '').replace('-right', '')
  return EXERCISES.filter(ex =>
    ex.primaryMuscles.includes(baseId) || ex.secondaryMuscles.includes(baseId)
  )
}
