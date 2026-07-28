import { todayISO } from "./dateUtils.js";

const MS_PER_DAY = 86400000;

// Date.now() alone can collide if summarizeSession is called twice in the
// same millisecond; this counter guarantees uniqueness regardless.
let idCounter = 0;

// Local midnight, matching todayISO/fmtDate's timezone-safe convention —
// never Date#toISOString (UTC), which can land on the wrong calendar day.
function toLocalMidnight(iso) {
  return new Date(iso + "T00:00:00").getTime();
}

function daysBetween(isoA, isoB) {
  return Math.round((toLocalMidnight(isoA) - toLocalMidnight(isoB)) / MS_PER_DAY);
}

// Summarizes a day's current state into a history record. `day` is
// DAYS[dayId], `state` is allState[dayId] — same shape App.jsx already
// computes doneSets/totalSets/pct from, factored out here so it's reusable
// and unit-testable.
export function summarizeSession(day, state, dateISO, dayId) {
  const activeExtras = day.pool.filter((ex) => state[ex.id]?.active);
  const visible = [...day.baseline, ...activeExtras];
  const totalSets = visible.reduce((a, e) => a + state[e.id].sets.length, 0);
  const doneSets = visible.reduce((a, e) => a + state[e.id].sets.filter((s) => s.done).length, 0);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

  return {
    id: `${dateISO}-${dayId}-${Date.now()}-${++idCounter}`,
    dateISO,
    dayId,
    dayName: day.name,
    focus: day.focus,
    doneSets,
    totalSets,
    pct,
  };
}

// Consecutive calendar days with at least one session, counted back from the
// most recent entry. If the most recent entry isn't dated today or
// yesterday, the streak is broken (0) — standard streak semantics.
export function computeStreak(history) {
  if (!history.length) return 0;
  const dates = [...new Set(history.map((h) => h.dateISO))].sort().reverse();

  if (daysBetween(todayISO(), dates[0]) > 1) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
