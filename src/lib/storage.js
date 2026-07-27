import { DAY_ORDER } from "../data/days.js";
import { initDay } from "../App.helpers.js";

export const STORAGE_KEY = "sean-workout-log-v1";

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt/unreadable — fall through to null, caller starts fresh
  }
  return null;
}

// Merges `partial` into whatever's currently stored and writes the result —
// safe for independent callers (LogScreen, the app shell) to each persist
// their own slice without clobbering the other's fields. onError is called
// with a human-readable message when the write fails (storage quota
// exceeded, private browsing restrictions, etc).
export function saveStore(partial, onError) {
  try {
    const current = loadStore() ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {
    onError?.("Could not save your workout — storage may be full or unavailable.");
  }
}

export function freshAllState() {
  const init = {};
  DAY_ORDER.forEach((id) => {
    init[id] = initDay(id);
  });
  return init;
}
