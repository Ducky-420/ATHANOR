const MS_PER_DAY = 86400000;

function toLocalMidnight(iso) {
  return new Date(iso + "T00:00:00").getTime();
}

function byDateAsc(a, b) {
  return a.dateISO < b.dateISO ? -1 : 1;
}

// Replaces the entry for entry.dateISO if one already exists (so logging
// weight twice in a day updates rather than duplicates), else appends.
// Returns a new array sorted ascending by date.
export function upsertEntry(bodyLog, entry) {
  const withoutSameDate = bodyLog.filter((e) => e.dateISO !== entry.dateISO);
  return [...withoutSameDate, entry].sort(byDateAsc);
}

// Delta vs. the immediately-preceding entry (chronologically), or null if
// there isn't one.
export function deltaFor(bodyLog, entry) {
  const sorted = [...bodyLog].sort(byDateAsc);
  const idx = sorted.findIndex((e) => e.dateISO === entry.dateISO);
  if (idx <= 0) return null;
  return entry.weight - sorted[idx - 1].weight;
}

// Delta vs. the entry closest to (but not after) 7 days before the latest
// entry. Falls back to the immediately-preceding entry if the log doesn't
// go back that far.
export function weeklyDelta(bodyLog) {
  if (bodyLog.length < 2) return null;
  const sorted = [...bodyLog].sort(byDateAsc);
  const latest = sorted[sorted.length - 1];
  const target = toLocalMidnight(latest.dateISO) - 7 * MS_PER_DAY;

  let reference = null;
  for (const e of sorted) {
    if (e.dateISO === latest.dateISO) break;
    if (toLocalMidnight(e.dateISO) <= target) reference = e;
  }
  if (!reference) reference = sorted[sorted.length - 2];

  return latest.weight - reference.weight;
}
