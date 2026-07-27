# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Log/Progress/Body navigation & redesign

Implemented from a genuine ATHANOR-specific design handoff (checked directly against the design tool via `DesignSync`, unlike an earlier mismatched attempt). This is a real feature addition, not a reskin — flagged and confirmed with the user before building, since it required two new persisted data domains the app didn't have.

- **Floating bottom tab bar** (`TabBar.jsx`): Log / Progress / Body, `backdrop-filter: blur(12px) saturate(140%)`, `--radius-float` (22px) glass pill, floats `14px` above the safe area instead of a flat edge-to-edge bar. `App.jsx` is now a thin navigation shell; the previous single-screen `App.jsx` body moved to `screens/LogScreen.jsx` almost unchanged.
- **Progress tab** (`ProgressScreen.jsx`): day streak, session count, and average completion stat cards; a completion-by-session bar chart; a recent-sessions list. Backed by a new `history` array persisted alongside existing data.
  - **Archiving**: pressing "Reset day" on the Log tab archives the day's summary into `history` — only if at least one set was done (empty resets aren't archived). The existing 30-second undo toast removes the archived entry too, so undo is exact.
  - **Streak**: consecutive calendar days with a session, counted back from the most recent entry; broken (0) if the most recent entry isn't dated today or yesterday.
- **Body tab** (`BodyScreen.jsx`): current weight, a trend line chart, a log-weight input (upserts by date, so logging twice in a day updates rather than duplicates), and a recent-entries list with per-entry and week-over-week deltas. Backed by a new `bodyLog` array.
- **New helpers**: `src/lib/sessionHistory.js` (`summarizeSession`, `computeStreak`), `src/lib/bodyLog.js` (`upsertEntry`, `deltaFor`, `weeklyDelta`) — pure, unit-tested logic.
- `saveStore` changed from "caller passes the full object" to a safe read-merge-write of a partial update, so `LogScreen`'s and the shell's independent persistence effects can't clobber each other. Existing `localStorage` data without `history`/`bodyLog` keys still loads correctly (both default to `[]`).
- Rest timer now floats above the tab bar (`bottom: calc(74px + safe-area)`) instead of the viewport edge; every screen's scroll padding clears the tab bar (`calc(88px + safe-area)`).
- Global press-state changed from `scale(0.94)` to the redesign spec's `scale(0.98)` at `90ms ease-out`.
- New tokens: `--radius-float`, `--gap-card`, `--gap-setrow`, `--pad-card`, `--gap-timer`, `--ease-pop`, `--ease-sheet`.
- Added `nav[aria-label="Main"]`, `aria-current="page"` on the active tab, and 44×44px tap targets on every tab item.

## 2026-07-27 — Visual polish pass

### Borders, elevation, and micro-interactions

- **Border system**: `--border`/`--border-hi` moved from flat opaque hex values to translucent white (`rgba(255,255,255,0.08)` / `0.14`) so card and divider edges read correctly against any surface tone underneath, instead of one fixed color everywhere.
- **Elevation**: added `--shadow-sm/md/lg` tokens (a hairline edge plus ambient darkness, not a flat drop-shadow) and applied them to exercise cards, the header, the extras picker panel, and the "Copy session log" button.
- **Floating bottom surfaces**: the rest timer and toast notifications now float above the viewport edge with rounded corners, a `12px` side/bottom inset, `backdrop-filter: blur(12px)` glass background (`--surface-glass`), and `--shadow-lg` — instead of a flat, edge-to-edge bar.
- **Active-state glow**: added `--accent-glow` and `--done-glow` tokens; the selected day tab and a completed set's toggle now carry a soft accent/success glow in addition to their existing fill.
- **Spacing**: modest padding/gap increases on exercise cards (header and body) for a slightly less cramped feel.
- **Hover polish**: added a `button:hover { filter: brightness(1.08) }` rule, guarded behind `@media (hover: hover) and (pointer: fine)` so it only applies on real mouse input and never causes a "stuck" hover state on touch devices.
- Note: the request that prompted this pass described a persistent "bottom tab bar" needing a floating offset — at the time, ATHANOR didn't have one (day switching was an inline button row, not a fixed nav bar), so the floating/glass treatment was applied to the two elements that were actually fixed to the bottom edge: the rest timer and toast stack. (A real floating tab bar was added the next day — see Unreleased above.)

### Fixed

- 7 hardcoded `#0A0810` literals replaced with `var(--bg)` across `App.jsx`, `ErrorBoundary`, `Toast`, `RestTimer`, `SetRow` for full design-token consistency.
- `ErrorBoundary`'s fallback screen now uses the shared `.app-shell` class (`100dvh` with a `100vh` fallback) instead of a `dvh`-only inline style with no fallback.

## 2026-07-27 — Vite migration & open-source release

- Migrated from a single vendored-React `index.html` to a Vite + React 18 project with real component modules, ESLint, and npm scripts.
- Mobile UX: 44×44px minimum touch targets, safe-area-inset padding, `100dvh` layout.
- Accessibility: `aria-label`s on icon-only controls, `aria-expanded`/`aria-controls` on exercise cards, visible `:focus-visible` ring, WCAG AA contrast fixes for the `--dim`/`--faint` tokens.
- Correctness: fixed a UTC-vs-local timezone bug in the date-key helper (now uses `toLocaleDateString('en-CA')`).
- Reliability: added a top-level `ErrorBoundary`, a toast notification system, storage-write error handling, and a 30-second undo after "Reset day".
- Added a Vitest + React Testing Library smoke-test suite.
- Set up CI (lint + build on every push/PR) and Vercel deployment (native Git integration — auto-deploy on push to `main`, preview URLs on every PR).
- Added standard OSS project files: `README.md`, `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates.
