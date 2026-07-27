import { render, screen, fireEvent } from "@testing-library/react";
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
});

describe("todayISO", () => {
  it("outputs a local YYYY-MM-DD date string", () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe(new Date().toLocaleDateString("en-CA"));
  });
});
