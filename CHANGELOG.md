# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Visual polish — borders, elevation, and micro-interactions

- **Border system**: `--border`/`--border-hi` moved from flat opaque hex values to translucent white (`rgba(255,255,255,0.08)` / `0.14`) so card and divider edges read correctly against any surface tone underneath, instead of one fixed color everywhere.
- **Elevation**: added `--shadow-sm/md/lg` tokens (a hairline edge plus ambient darkness, not a flat drop-shadow) and applied them to exercise cards, the header, the extras picker panel, and the "Copy session log" button.
- **Floating bottom surfaces**: the rest timer and toast notifications now float above the viewport edge with rounded corners, a `12px` side/bottom inset, `backdrop-filter: blur(12px)` glass background (`--surface-glass`), and `--shadow-lg` — instead of a flat, edge-to-edge bar.
- **Active-state glow**: added `--accent-glow` and `--done-glow` tokens; the selected day tab and a completed set's toggle now carry a soft accent/success glow in addition to their existing fill.
- **Spacing**: modest padding/gap increases on exercise cards (header and body) for a slightly less cramped feel.
- **Hover polish**: added a `button:hover { filter: brightness(1.08) }` rule, guarded behind `@media (hover: hover) and (pointer: fine)` so it only applies on real mouse input and never causes a "stuck" hover state on touch devices.
- Note: the request that prompted this pass described a persistent "bottom tab bar" needing a floating offset — ATHANOR doesn't have one (day switching is an inline button row, not a fixed nav bar), so the floating/glass treatment was applied to the two elements that are actually fixed to the bottom edge: the rest timer and toast stack.

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
