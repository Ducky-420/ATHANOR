import { describe, expect, it } from "vitest";
import { summarizeSession, computeStreak } from "./sessionHistory.js";
import { DAYS } from "../data/days.js";
import { initDay } from "../App.helpers.js";
import { todayISO } from "./dateUtils.js";

// Local-midnight day offset from today, matching the app's own timezone-safe
// date handling (never toISOString/UTC).
function daysAgoISO(n) {
  const d = new Date(todayISO() + "T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA");
}

describe("summarizeSession", () => {
  it("computes doneSets/totalSets/pct from baseline exercises only when no extras are active", () => {
    const day = DAYS.d1;
    const state = initDay("d1");
    state.a1.sets[0].done = true;
    state.a1.sets[1].done = true;

    const summary = summarizeSession(day, state, "2026-07-28", "d1");

    const expectedTotal = day.baseline.reduce((a, ex) => a + ex.sets, 0);
    expect(summary.totalSets).toBe(expectedTotal);
    expect(summary.doneSets).toBe(2);
    expect(summary.pct).toBe(Math.round((2 / expectedTotal) * 100));
    expect(summary.dayName).toBe(day.name);
    expect(summary.focus).toBe(day.focus);
    expect(summary.dateISO).toBe("2026-07-28");
    expect(summary.dayId).toBe("d1");
  });

  it("includes active extras in the total but excludes inactive ones", () => {
    const day = DAYS.d1;
    const state = initDay("d1");
    const firstExtra = day.pool[0];
    state[firstExtra.id].active = true;
    state[firstExtra.id].sets[0].done = true;

    const summary = summarizeSession(day, state, "2026-07-28", "d1");

    const expectedTotal = day.baseline.reduce((a, ex) => a + ex.sets, 0) + firstExtra.sets;
    expect(summary.totalSets).toBe(expectedTotal);
    expect(summary.doneSets).toBe(1);
  });

  it("returns pct 0 when nothing is done, never NaN", () => {
    const day = DAYS.d1;
    const state = initDay("d1");
    const summary = summarizeSession(day, state, "2026-07-28", "d1");
    expect(summary.doneSets).toBe(0);
    expect(summary.pct).toBe(0);
  });

  it("produces a unique id per call", () => {
    const day = DAYS.d1;
    const state = initDay("d1");
    const a = summarizeSession(day, state, "2026-07-28", "d1");
    const b = summarizeSession(day, state, "2026-07-28", "d1");
    expect(a.id).not.toBe(b.id);
  });
});

describe("computeStreak", () => {
  it("returns 0 for an empty history", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 0 when the most recent session is older than yesterday", () => {
    const history = [{ dateISO: daysAgoISO(3) }, { dateISO: daysAgoISO(4) }];
    expect(computeStreak(history)).toBe(0);
  });

  it("counts a single session today as a streak of 1", () => {
    const history = [{ dateISO: daysAgoISO(0) }];
    expect(computeStreak(history)).toBe(1);
  });

  it("counts a single session yesterday (no gap yet) as a streak of 1", () => {
    const history = [{ dateISO: daysAgoISO(1) }];
    expect(computeStreak(history)).toBe(1);
  });

  it("counts consecutive days correctly", () => {
    const history = [{ dateISO: daysAgoISO(0) }, { dateISO: daysAgoISO(1) }, { dateISO: daysAgoISO(2) }];
    expect(computeStreak(history)).toBe(3);
  });

  it("stops counting at the first gap", () => {
    const history = [{ dateISO: daysAgoISO(0) }, { dateISO: daysAgoISO(1) }, { dateISO: daysAgoISO(3) }];
    expect(computeStreak(history)).toBe(2);
  });

  it("dedupes multiple sessions on the same day to one streak day", () => {
    const history = [{ dateISO: daysAgoISO(0) }, { dateISO: daysAgoISO(0) }, { dateISO: daysAgoISO(1) }];
    expect(computeStreak(history)).toBe(2);
  });
});
