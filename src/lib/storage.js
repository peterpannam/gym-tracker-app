const PROFILES_KEY = 'gymProfiles'
const SESSION_KEY = 'gymSession'

function workoutsKey(profileId) {
  return `gymWorkouts_${profileId}`
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export function getProfiles() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]')
  } catch {
    return []
  }
}

export function createProfile(name, pin) {
  const profiles = getProfiles()
  const profile = {
    id: Date.now().toString(),
    name: name.trim(),
    pin,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PROFILES_KEY, JSON.stringify([...profiles, profile]))
  return profile
}

export function getProfileById(profileId) {
  return getProfiles().find(p => p.id === profileId) || null
}

export function verifyPin(profileId, pin) {
  const profile = getProfileById(profileId)
  return profile != null && profile.pin === pin
}

export function deleteProfile(profileId) {
  const profiles = getProfiles().filter(p => p.id !== profileId)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  localStorage.removeItem(workoutsKey(profileId))
}

// ── Session ───────────────────────────────────────────────────────────────────

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(profileId) {
  const profile = getProfileById(profileId)
  if (!profile) return false
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ profileId: profile.id, name: profile.name }))
  return true
}

export function clearSession() {
  if (typeof window !== 'undefined') sessionStorage.removeItem(SESSION_KEY)
}

// ── Workouts ──────────────────────────────────────────────────────────────────

export function getWorkouts(profileId) {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(workoutsKey(profileId)) || '[]')
  } catch {
    return []
  }
}

export function saveWorkout(profileId, workoutData) {
  const workouts = getWorkouts(profileId)
  const entry = {
    ...workoutData,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  }
  const updated = [entry, ...workouts]
  localStorage.setItem(workoutsKey(profileId), JSON.stringify(updated))
  return entry
}

export function updateWorkout(profileId, workoutId, changes) {
  const workouts = getWorkouts(profileId)
  const updated = workouts.map(w => w.id === workoutId ? { ...w, ...changes } : w)
  localStorage.setItem(workoutsKey(profileId), JSON.stringify(updated))
  return updated
}

export function deleteWorkout(profileId, workoutId) {
  const updated = getWorkouts(profileId).filter(w => w.id !== workoutId)
  localStorage.setItem(workoutsKey(profileId), JSON.stringify(updated))
  return updated
}
