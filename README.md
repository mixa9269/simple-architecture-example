# simple-architecture-example

Homework projects for the **Simple Architecture** online bootcamp (React).

## Homework #1 — TV Shows Explorer

Search TV shows via the public [TVmaze API](https://www.tvmaze.com/api):

- debounced search with cancellation of outdated requests (hand-written, no `useQuery`)
- loading skeletons, error state with retry, empty state
- pagination — 3 shows per page
- genre filter chips built from the current results, with reset ("All")

Stack: Vite, React, TypeScript, [Mantine](https://mantine.dev), CSS Modules, Vitest.

## Run

```bash
npm i
npm run dev        # http://localhost:5173
npm run lint       # ESLint incl. Simple Architecture rules
npm run typecheck
npm test           # Vitest
npm run build
```

## AI rules

Architecture rules for Claude Code live in [`.claude/rules`](.claude/rules):

- View layer = JSX + `usePresenter()` only
- All component logic lives in `usePresenter` and smaller hooks
- Max 120 lines per file (enforced by ESLint)
- Tree-shaped component folders that mirror the UI
- `components/` folders hold reusable components only

ESLint enforcement: [`eslint/simple-architecture.js`](eslint/simple-architecture.js).

Course materials are kept locally in `course-materials/` (git-ignored).
