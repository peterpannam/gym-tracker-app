const PROFILES_KEY = 'gymProfiles'
const SESSION_KEY = 'gymSession'

function workoutsKey(profileId) {
  return `gymWorkouts_${profileId}`
}

// ── PIN hashing ────────────────────────────────────────────────────────────────

async function hashPin(pin, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ':' + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
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

export async function createProfile(name, pin) {
  const profiles = getProfiles()
  const id = Date.now().toString()
  const pinHash = await hashPin(pin, id)
  const profile = {
    id,
    name: name.trim(),
    pinHash,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PROFILES_KEY, JSON.stringify([...profiles, profile]))
  return profile
}

export function getProfileById(profileId) {
  return getProfiles().find(p => p.id === profileId) || null
}

export async function verifyPin(profileId, pin) {
  const profile = getProfileById(profileId)
  if (!profile) return false
  // Support legacy profiles that stored plaintext pin
  if (profile.pin !== undefined) return profile.pin === pin
  const hash = await hashPin(pin, profileId)
  return profile.pinHash === hash
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
  // Use local date so the workout groups under the user's calendar day, not UTC
  const now = new Date()
  const date = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0')
  const entry = {
    ...workoutData,
    id: Date.now().toString(),
    date,
    timestamp: now.toISOString(),
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
