# Data model

Athanor keeps everything in a single `localStorage` key, `sean-workout-log-v1` (see `STORAGE_KEY` in [`src/lib/storage.js`](src/lib/storage.js)). There's no backend and no other storage — this file is the entire persisted shape.

```ts
{
  // Owned by src/screens/LogScreen.jsx
  allState: { [dayId: string]: DayState },
  dayId: string,        // currently selected day, e.g. "d1"
  dateISO: string,      // YYYY-MM-DD, editable session date shown in the header

  // Owned by src/App.jsx (the navigation shell)
  history: SessionRecord[],
  bodyLog: BodyEntry[],
}
```

## `allState` — today's workout state

One entry per program day (`d1`–`d4`, see [`src/data/days.js`](src/data/days.js)). Shape comes from `initDay()`/`blankSets()` in [`src/App.helpers.js`](src/App.helpers.js):

```ts
type DayState = {
  [exerciseId: string]: {
    sets: { n: number, w: string, r: string, done: boolean }[], // n=set number, w=weight, r=reps
    note: string,
    variant: string | null,      // e.g. "Free Weight" — null if the exercise has no variants
    active: boolean,              // baseline exercises are always active; pool ("extras") exercises toggle
  }
}
```

This has existed since the first Vite migration and is unrelated to `history`/`bodyLog` — it's always-current, in-progress state for the four program days, not a log of past sessions.

## `history` — archived sessions (Progress tab)

Appended to by `LogScreen`'s `resetDay()`, read by `ProgressScreen`. Built by `summarizeSession()` in [`src/lib/sessionHistory.js`](src/lib/sessionHistory.js):

```ts
type SessionRecord = {
  id: string,        // `${dateISO}-${dayId}-${Date.now()}` — stable enough for React keys and undo removal
  dateISO: string,
  dayId: string,      // "d1".."d4"
  dayName: string,    // "Upper A" — captured at archive time, so renaming a day in days.js later doesn't rewrite history
  focus: string,       // "Chest + Triceps" — same reasoning
  doneSets: number,
  totalSets: number,
  pct: number,         // 0-100, rounded
}
```

**When a record is created:** pressing "Reset day" on the Log tab archives the *current* day's state — but only if `doneSets > 0` (an empty reset isn't archived, so clearing inputs by mistake before logging anything doesn't pollute history). The existing 30-second undo toast removes the record again by `id` if the user undoes the reset, so undo is exact — it doesn't just restore the set data, it also un-archives.

**Streak semantics** (`computeStreak()`): consecutive calendar days with ≥1 record, counted backward from the most recent record's date. If the most recent record isn't dated today or yesterday, the streak is broken (`0`). Multiple sessions on the same calendar day count once toward the streak (deduplicated by date) but each still appears separately in the recent-sessions list and the completion chart.

## `bodyLog` — weight entries (Body tab)

A flat array, **not** a map — one entry per calendar date:

```ts
type BodyEntry = {
  dateISO: string,
  weight: number,     // kg, parsed float
}
```

**Upsert, not append:** `upsertEntry()` in [`src/lib/bodyLog.js`](src/lib/bodyLog.js) replaces the existing entry for `dateISO` if one exists, else appends — logging weight twice in a day updates the value rather than creating a duplicate row. The array returned is always sorted ascending by date.

**Deltas:**
- `deltaFor(bodyLog, entry)` — vs. the immediately-preceding entry (chronologically), or `null` if there isn't one.
- `weeklyDelta(bodyLog)` — the latest entry vs. the entry closest to (but not after) 7 days earlier; falls back to the immediately-preceding entry if the log doesn't go back that far, or `null` if there are fewer than 2 entries.

## Persistence: safe partial writes

`LogScreen` and the `App` shell each own a different slice of the store (`allState`/`dayId`/`dateISO` vs. `history`/`bodyLog`) and persist independently via their own `useEffect`. Naively writing `localStorage.setItem(KEY, JSON.stringify(mySlice))` from two places would let whichever effect fires second silently erase the other's fields.

`saveStore()` avoids this with a read-merge-write:

```js
export function saveStore(partial, onError) {
  try {
    const current = loadStore() ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {
    onError?.("Could not save your workout — storage may be full or unavailable.");
  }
}
```

Each caller passes only the keys it owns (e.g. `saveStore({ history, bodyLog })`); the existing stored blob is read fresh and merged in first, so the other slice's fields survive untouched. `onError` is called (not thrown) on write failure — quota exceeded, private browsing, etc. — and both call sites wire it to an error toast rather than failing silently.

## Backward compatibility

`history` and `bodyLog` didn't exist before this feature shipped. `loadStore()` returns whatever's actually in storage — for a user who hasn't opened the app since before this change, that means no `history`/`bodyLog` keys at all. Both are read as `stored?.history ?? []` / `stored?.bodyLog ?? []` at the call site, so existing users load straight into "no sessions yet" / "no entries yet" empty states with zero data loss or migration step. This was verified directly (a store shape with only `allState`/`dayId`/`dateISO` loads and renders correctly) rather than just assumed.
