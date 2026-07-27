# Contributing to Athanor

Thanks for considering a contribution! This is a small, focused project — please keep PRs scoped and readable.

## Dev setup

```bash
git clone https://github.com/Ducky-420/ATHANOR.git
cd ATHANOR
npm install
npm run dev
```

## Before opening a PR

- Run `npm run lint` — CI will fail the PR if it doesn't pass.
- Run `npm run build` to confirm it compiles cleanly.
- Test your change in the browser at a mobile viewport width, since this app is designed mobile-first (safe-area insets, 44×44px touch targets, `dvh` layout).

## Code conventions

- Functional components + hooks, no class components except `ErrorBoundary` (which requires one).
- **Styling**: components use inline `style={{ ... }}` objects that reference CSS custom properties defined in `src/styles/tokens.css` (e.g. `style={{ color: 'var(--text-primary)' }}`), not hardcoded hex values or CSS Modules. Please follow this convention rather than mixing in a different styling approach.
- Keep `src/data/days.js` as plain data — no logic there.
- New icon-only buttons need an `aria-label`. New interactive controls should be at least 44×44px.
- If you add a color to `src/styles/tokens.css`, check it against WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components) against the backgrounds it'll actually be used on.

## Branching / PRs

- Branch from `main`, open a PR back into `main`.
- Keep commits focused; a clear PR description of *why* is more useful than an exhaustive *what*.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/`.
