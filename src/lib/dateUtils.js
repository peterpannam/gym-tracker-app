export function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function todayYmd() { return ymd(new Date()); }

export function daysAgoYmd(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

function ts(w) {
  return typeof w.timestamp === 'number' ? w.timestamp : new Date(w.timestamp).getTime();
}

export function workoutStreak(workouts) {
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

export function thisWeekCount(workouts) {
  const cutoff = Date.now() - 7 * 864e5;
  return new Set(workouts.filter(w => ts(w) >= cutoff).map(w => w.date)).size;
}
