import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProgressScreen from "./ProgressScreen.jsx";

function session(overrides) {
  return {
    id: "id-1",
    dateISO: "2026-07-28",
    dayId: "d1",
    dayName: "Upper A",
    focus: "Chest + Triceps",
    doneSets: 20,
    totalSets: 29,
    pct: 69,
    ...overrides,
  };
}

describe("ProgressScreen", () => {
  it("shows the empty state when there's no history", () => {
    render(<ProgressScreen history={[]} />);
    expect(screen.getAllByText("No sessions yet").length).toBeGreaterThan(0);
    expect(screen.getByText(/Finish a workout/)).toBeInTheDocument();
  });

  it("renders stat cards computed from history", () => {
    render(<ProgressScreen history={[session()]} />);
    expect(screen.getByText("1 session logged")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Day streak")).toBeInTheDocument();

    const avgCompleteCard = screen.getByText("Avg. complete").closest("div");
    expect(avgCompleteCard).toHaveTextContent("69%");
  });

  it("lists recent sessions with day name, sets, and date", () => {
    render(<ProgressScreen history={[session()]} />);
    expect(screen.getByText("Upper A")).toBeInTheDocument();
    expect(screen.getByText("20/29 sets")).toBeInTheDocument();
  });

  it("shows multiple sessions most-recent-first", () => {
    const older = session({ id: "id-old", dateISO: "2026-07-20", dayName: "Lower A", doneSets: 10, totalSets: 20, pct: 50 });
    const newer = session({ id: "id-new", dateISO: "2026-07-27", dayName: "Upper B", doneSets: 15, totalSets: 30, pct: 50 });
    render(<ProgressScreen history={[older, newer]} />);

    const names = screen.getAllByText(/^(Upper A|Upper B|Lower A)$/).map((el) => el.textContent);
    expect(names[0]).toBe("Upper B"); // most recently archived listed first
  });
});
