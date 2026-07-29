// Standard kg plate set found at most gyms, largest first.
export const PLATE_SET = [20, 15, 10, 5, 2.5, 1.25];

// Greedy breakdown of a PER-SIDE target weight into plates. ATHANOR's own
// convention already has `perSide` exercises logged as the per-side number
// (see SetRow's "kg/side" unit label) — not total barbell weight — so this
// deliberately does not subtract a bar weight; the target IS the per-side
// plate weight already.
//
// Returns { plates: [{ weight, count }, ...], remainder }. remainder > 0
// means the target can't be hit exactly with this plate set (e.g. a target
// that isn't a multiple of the smallest plate) — the UI should surface that
// rather than silently rounding.
export function calculatePlates(targetPerSide, plateSet = PLATE_SET) {
  const target = Number(targetPerSide);
  if (!Number.isFinite(target) || target <= 0) return { plates: [], remainder: 0 };

  let remaining = target;
  const plates = [];
  for (const weight of plateSet) {
    const count = Math.floor((remaining + 1e-9) / weight);
    if (count > 0) {
      plates.push({ weight, count });
      remaining = Math.round((remaining - count * weight) * 100) / 100;
    }
  }
  return { plates, remainder: Math.max(remaining, 0) };
}
