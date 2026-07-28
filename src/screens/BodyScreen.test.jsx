import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BodyScreen from "./BodyScreen.jsx";
import { todayISO } from "../lib/dateUtils.js";

describe("BodyScreen", () => {
  it("shows the empty state when there are no entries", () => {
    render(<BodyScreen bodyLog={[]} onAddEntry={() => {}} />);
    expect(screen.getByText("No entries yet")).toBeInTheDocument();
  });

  it("saves a valid weight entry for today", () => {
    const onAddEntry = vi.fn();
    render(<BodyScreen bodyLog={[]} onAddEntry={onAddEntry} />);

    fireEvent.change(screen.getByLabelText("Log today's weight"), { target: { value: "78.4" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onAddEntry).toHaveBeenCalledWith({ dateISO: todayISO(), weight: 78.4 });
  });

  it("clears the input after a successful save", () => {
    render(<BodyScreen bodyLog={[]} onAddEntry={() => {}} />);
    const input = screen.getByLabelText("Log today's weight");

    fireEvent.change(input, { target: { value: "78.4" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(input.value).toBe("");
  });

  it("does not save an empty or non-numeric entry", () => {
    const onAddEntry = vi.fn();
    render(<BodyScreen bodyLog={[]} onAddEntry={onAddEntry} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onAddEntry).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Log today's weight"), { target: { value: "not a number" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onAddEntry).not.toHaveBeenCalled();
  });

  it("shows the current weight and a delta against the previous entry", () => {
    const bodyLog = [
      { dateISO: "2026-07-21", weight: 79.0 },
      { dateISO: todayISO(), weight: 78.4 },
    ];
    render(<BodyScreen bodyLog={bodyLog} onAddEntry={() => {}} />);

    expect(screen.getByText("78.4")).toBeInTheDocument();
    expect(screen.getByText(/this week/)).toHaveTextContent("0.6 kg this week");
    expect(screen.getAllByText(/0\.6 kg/).length).toBeGreaterThan(0);
  });
});
