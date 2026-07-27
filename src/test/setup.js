import "@testing-library/jest-dom/vitest";

// jsdom's CSS engine doesn't fully resolve calc() expressions containing
// env() (used throughout this app for safe-area-aware layout) and throws
// instead of falling back — real browsers handle this correctly, this only
// guards Testing Library's accessibility-tree walk (which calls
// getComputedStyle on every ancestor) from crashing in the test environment.
const realGetComputedStyle = window.getComputedStyle.bind(window);
const fallbackStyle = { getPropertyValue: () => "" };
window.getComputedStyle = (...args) => {
  try {
    return realGetComputedStyle(...args);
  } catch {
    return fallbackStyle;
  }
};
