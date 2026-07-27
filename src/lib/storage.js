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

// onError is called with a human-readable message when the write fails
// (storage quota exceeded, private browsing restrictions, etc).
export function saveStore(store, onError) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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
