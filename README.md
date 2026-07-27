# Athanor

[![CI](https://github.com/Ducky-420/ATHANOR/actions/workflows/ci.yml/badge.svg)](https://github.com/Ducky-420/ATHANOR/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A minimal, offline-first workout logging PWA. Pick a day, log your sets, keep your streak — nothing leaves your device.

## Features

- **Three sections** behind a floating bottom tab bar: **Log** (today's workout), **Progress** (session history, streak, completion chart), **Body** (weight trend)
- **4-day upper/lower split** built in, with baseline exercises plus an optional "extras" pool per day
- **Per-set logging** — weight, reps, and a done toggle, with sensible units per exercise (kg, kg/side, assist, timed)
- **Rest timer** that auto-starts after a completed set (longer rest for compound lifts), floats as a glass sheet above the tab bar
- **Session notes and exercise variants** (e.g. free weight vs. pin-select) per exercise
- **Session history** — finishing a day and hitting Reset archives it to the Progress tab (streak, completion-by-session chart, recent sessions), with a 30-second undo
- **Body weight tracking** — log a daily weight, see a trend line and week-over-week delta
- **Copy session log** — formats the whole session as plain text for pasting into Notes/Slack/wherever
- **Installable PWA** with a splash screen, safe-area-aware layout, and offline support via `localStorage`
- **Local-only data** — everything is stored in the browser's `localStorage`; nothing is sent to a server
- Accessible: keyboard-navigable with visible focus states, labeled controls, 44×44px minimum touch targets, and WCAG AA-compliant contrast

## Architecture

- **[Vite](https://vitejs.dev/)** + **React 18** — no backend, no framework beyond what Vite + React provide, no router (screen switching is plain state in `App.jsx`)
- `App.jsx` is a thin navigation shell: it owns `screen`/`history`/`bodyLog` state and renders the floating `TabBar` plus the active screen (`LogScreen`, `ProgressScreen`, or `BodyScreen`)
- `LogScreen` owns today's workout state (unchanged from before the nav was added) and persists it independently from `history`/`bodyLog` — `saveStore` does a safe read-merge-write so the two can't clobber each other
- Static workout program data lives in `src/data/days.js`
- Colors are CSS custom properties defined in `src/styles/tokens.css`, referenced from component inline styles — see [CONTRIBUTING.md](CONTRIBUTING.md) for the convention
- The rest timer is code-split via `React.lazy`/`Suspense`, since it's the one conditionally-rendered overlay in the app
- A top-level `ErrorBoundary` and a small toast/undo system handle render errors and storage failures gracefully

```
src/
├── main.jsx              # entry: ErrorBoundary + ToastProvider + App
├── App.jsx                # navigation shell: screen/history/bodyLog state + TabBar
├── screens/                 # LogScreen, ProgressScreen, BodyScreen
├── data/days.js            # the workout program (days, exercises, pools)
├── lib/                    # storage, date, session-history, and body-log helpers
├── hooks/                   # ToastContext, ToastProvider, useToast
├── components/              # TabBar, RestTimer, SetRow, ExCard, Toast, EmptyState, ErrorBoundary
└── styles/                  # design tokens + shell CSS
```

## Quickstart

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint       # run ESLint
npm run test        # run the Vitest suite
```

## Deployment

### Production

- **URL:** [athanor-red.vercel.app](https://athanor-red.vercel.app)
- **Provider:** [Vercel](https://vercel.com), connected directly to this GitHub repo (native Git integration — no GitHub Actions involved in deploys)
- **CI status:** ![Build Status](https://github.com/Ducky-420/ATHANOR/actions/workflows/ci.yml/badge.svg)

### How it works

1. GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, lint, and build on every push/PR to `main` — this is a correctness gate, independent of deployment.
2. Vercel's GitHub App watches the same repo separately. Every push to `main` triggers a new production deployment automatically, live within about a minute.
3. Every pull request gets its own preview deployment with a unique URL, posted as a comment/check on the PR by Vercel — test changes live before merging, with zero impact on production.

### Manual deploy

If you have the [Vercel CLI](https://vercel.com/docs/cli) installed and linked (`vercel link`):

```bash
npm run build
vercel --prod
```

## Privacy

Athanor stores everything locally in your browser (`localStorage`). There is no backend, no account, and no analytics — your workout data never leaves your device.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please also read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
