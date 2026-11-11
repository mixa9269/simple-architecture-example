---
description: Simple Architecture — hard limit of 120 lines per file, enforced by ESLint max-lines
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Max 120 lines per file

No source file may exceed **120 lines** (blank lines and comments count). It is enforced by `max-lines` in `eslint/simple-architecture.js`. Aim for ~70 lines; small files read like a book's table of contents.

Never silence it with `eslint-disable max-lines` or by squeezing code onto fewer lines.

## When a file approaches the limit

1. **Presenter too big** → extract a concern into its own hook (`useX.ts`) next to it.
2. **Pure logic inside a hook** (validation, mapping, filtering) → extract into a plain function file (`collectGenres.ts`).
3. **JSX too big** → extract a child component into a nested folder (see `sa-component-tree.md`).
4. **Types too big** → move them to `types.ts` in the same folder.
5. **CSS too big** → the component is doing too much; split the component.

## Good

```
ShowsExplorer/
  ShowsExplorer.tsx      (35 lines)
  usePresenter.ts        (30 lines)
  useShowsSearch.ts      (60 lines)
  useSearchSelection.ts  (40 lines)
  collectGenres.ts       (12 lines)
```

## Bad

```
ShowsExplorer/
  ShowsExplorer.tsx      (210 lines, everything inline)
```
