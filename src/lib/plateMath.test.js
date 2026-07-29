import { describe, expect, it } from "vitest";
import { calculatePlates, PLATE_SET } from "./plateMath.js";

describe("calculatePlates", () => {
  it("returns nothing for zero, negative, or non-numeric input", () => {
    expect(calculatePlates(0)).toEqual({ plates: [], remainder: 0 });
    expect(calculatePlates(-5)).toEqual({ plates: [], remainder: 0 });
    expect(calculatePlates("")).toEqual({ plates: [], remainder: 0 });
    expect(calculatePlates("abc")).toEqual({ plates: [], remainder: 0 });
  });

  it("greedily breaks down an exact target with no remainder", () => {
    const { plates, remainder } = calculatePlates(47.5);
    expect(remainder).toBe(0);
    expect(plates).toEqual([
      { weight: 20, count: 2 },
      { weight: 5, count: 1 },
      { weight: 2.5, count: 1 },
    ]);
  });

  it("handles a target smaller than the largest plate", () => {
    const { plates, remainder } = calculatePlates(3.75);
    expect(remainder).toBe(0);
    expect(plates).toEqual([
      { weight: 2.5, count: 1 },
      { weight: 1.25, count: 1 },
    ]);
  });

  it("accepts a string input (as typed in the UI)", () => {
    const { plates } = calculatePlates("20");
    expect(plates).toEqual([{ weight: 20, count: 1 }]);
  });

  it("reports a remainder when the target isn't reachable with this plate set", () => {
    const { remainder } = calculatePlates(20.6);
    expect(remainder).toBeCloseTo(0.6, 5);
  });

  it("respects a custom plate set", () => {
    const { plates, remainder } = calculatePlates(12.5, [10, 5]);
    expect(remainder).toBe(2.5);
    expect(plates).toEqual([{ weight: 10, count: 1 }]);
  });

  it("default plate set is largest-first", () => {
    expect(PLATE_SET).toEqual([20, 15, 10, 5, 2.5, 1.25]);
  });
});
