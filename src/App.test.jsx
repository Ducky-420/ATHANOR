import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App.jsx";
import { ToastProvider } from "./hooks/ToastProvider.jsx";
import { todayISO } from "./lib/dateUtils.js";

function renderApp() {
  return render(
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders without crashing", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: "Upper A" })).toBeInTheDocument();
    expect(screen.getByText("Chest + Triceps")).toBeInTheDocument();
  });

  it("switches days when a day tab is clicked", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: "Upper A" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "DAY 2" }));

    expect(screen.getByRole("heading", { name: "Lower A" })).toBeInTheDocument();
    expect(screen.getByText("Quads")).toBeInTheDocument();
  });

  it("switches between Log, Progress, and Body via the tab bar", () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Main" });

    fireEvent.click(within(nav).getByRole("button", { name: "Progress" }));
    expect(screen.getByRole("heading", { name: "Progress" })).toBeInTheDocument();
    expect(screen.getByText(/Finish a workout/)).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Body" }));
    expect(screen.getByRole("heading", { name: "Body" })).toBeInTheDocument();
    expect(screen.getByText("No entries yet")).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Log" }));
    expect(screen.getByRole("heading", { name: "Upper A" })).toBeInTheDocument();
  });

  it("archives a session to Progress on Reset day, and Undo removes it again", () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Main" });

    fireEvent.click(screen.getByRole("button", { name: /Incline Chest Press/ }));
    fireEvent.click(screen.getByRole("button", { name: "Mark set 1 as done" }));

    fireEvent.click(screen.getByRole("button", { name: "Reset day" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    fireEvent.click(within(nav).getByRole("button", { name: "Progress" }));
    expect(screen.getByText("1 session logged")).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole("button", { name: "Log" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    fireEvent.click(within(nav).getByRole("button", { name: "Progress" }));
    expect(screen.getByText(/Finish a workout/)).toBeInTheDocument();
  });
});

describe("todayISO", () => {
  it("outputs a local YYYY-MM-DD date string", () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toLocaleDateString("en-CA"));
  });
});
