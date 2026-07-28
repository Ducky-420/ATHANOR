import { describe, expect, it } from "vitest";
import { upsertEntry, deltaFor, weeklyDelta } from "./bodyLog.js";

describe("upsertEntry", () => {
  it("appends a new entry and keeps the log sorted ascending by date", () => {
    const log = [{ dateISO: "2026-07-01", weight: 80 }];
    const result = upsertEntry(log, { dateISO: "2026-06-28", weight: 81 });
    expect(result.map((e) => e.dateISO)).toEqual(["2026-06-28", "2026-07-01"]);
  });

  it("replaces the existing entry for the same date instead of duplicating", () => {
    const log = [{ dateISO: "2026-07-01", weight: 80 }];
    const result = upsertEntry(log, { dateISO: "2026-07-01", weight: 79.5 });
    expect(result).toHaveLength(1);
    expect(result[0].weight).toBe(79.5);
  });

  it("does not mutate the original array", () => {
    const log = [{ dateISO: "2026-07-01", weight: 80 }];
    upsertEntry(log, { dateISO: "2026-07-02", weight: 79 });
    expect(log).toHaveLength(1);
  });
});

describe("deltaFor", () => {
  it("returns null for the first (only) entry", () => {
    const log = [{ dateISO: "2026-07-01", weight: 80 }];
    expect(deltaFor(log, log[0])).toBeNull();
  });

  it("returns the difference vs. the immediately-preceding entry", () => {
    const log = [
      { dateISO: "2026-07-01", weight: 80 },
      { dateISO: "2026-07-02", weight: 79.5 },
      { dateISO: "2026-07-03", weight: 79.8 },
    ];
    expect(deltaFor(log, log[1])).toBeCloseTo(-0.5);
    expect(deltaFor(log, log[2])).toBeCloseTo(0.3);
  });
});

describe("weeklyDelta", () => {
  it("returns null with fewer than 2 entries", () => {
    expect(weeklyDelta([])).toBeNull();
    expect(weeklyDelta([{ dateISO: "2026-07-01", weight: 80 }])).toBeNull();
  });

  it("compares against the entry closest to 7 days before the latest, without going over", () => {
    const log = [
      { dateISO: "2026-07-14", weight: 80 }, // 8 days before latest
      { dateISO: "2026-07-15", weight: 79.6 }, // 7 days before latest — should be picked
      { dateISO: "2026-07-20", weight: 79.0 },
      { dateISO: "2026-07-22", weight: 78.4 }, // latest
    ];
    expect(weeklyDelta(log)).toBeCloseTo(78.4 - 79.6);
  });

  it("falls back to the immediately-preceding entry when the log doesn't go back 7 days", () => {
    const log = [
      { dateISO: "2026-07-21", weight: 79.0 },
      { dateISO: "2026-07-22", weight: 78.4 },
    ];
    expect(weeklyDelta(log)).toBeCloseTo(78.4 - 79.0);
  });
});
