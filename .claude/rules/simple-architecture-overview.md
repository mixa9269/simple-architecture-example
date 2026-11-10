---
description: Simple Architecture (React) — overview of the rules every component in this project must follow
---

# Simple Architecture — overview

This project follows **Simple Architecture**, a React architecture inspired by *Clean Architecture* and iOS **VIPER** (View, Interactor, Presenter, Entity, Router).

Lesson 1 covers only **View** and **Presenter**. Interactor, Entity and Router come in later lessons — do not invent them yet; put all logic in the Presenter layer.

## Rules

| Rule | File |
|---|---|
| A component is View only: JSX + `usePresenter()` | `sa-view-layer.md` |
| All logic lives in `usePresenter` and smaller hooks/functions | `sa-presenter-layer.md` |
| Max **120 lines** per file (ESLint `max-lines`) | `sa-file-size-120.md` |
| Each component has its own folder; single-use children nest inside the parent; folders mirror the UI | `sa-component-tree.md` |
| `components/` folders hold reusable components only, used only below in the tree | `sa-reusable-components.md` |

Styles: CSS Modules (`styles.module.css`) + CSS variables, no preprocessors.

ESLint enforcement: `eslint/simple-architecture.js` (already spread into `eslint.config.js`).

## UI library: Mantine

- Render Mantine components (`TextInput`, `Chip`, `Pagination`, `Card`, `Skeleton`, …) directly in the View.
- Mantine hooks (`useDisclosure`, …) are hooks — call them only in a presenter.
- Homework logic is hand-written: data fetching (no `useQuery`), debounce, pagination. Don't use `useDebouncedValue` / `usePagination` from `@mantine/hooks` for it.
- Style with `className` / `classNames` + CSS Modules and `--mantine-*` variables, not with computed `style` props.

## Project tree (TV Shows Explorer homework)

```
src/
  main.tsx                     # MantineProvider + <App/> (exempt from View rule)
  theme.ts                     # Mantine createTheme
  index.css                    # global CSS variables
  App/
    App.tsx, usePresenter.ts, styles.module.css
    ShowsExplorer/
      ShowsExplorer.tsx, usePresenter.ts, styles.module.css
      useShowsSearch.ts        # debounce + fetch + AbortController + status
      useDebouncedValue.ts, getSearchStatus.ts, searchShows.ts, mapShow.ts
      useGenreFilter.ts, collectGenres.ts, filterByGenre.ts
      usePagination.ts, paginate.ts
      types.ts, testFixtures.ts, *.test.ts
      SearchInput/
      ResultsStatus/           # + formatSummary.ts
      GenreChips/
      ShowsList/
        ShowCard/
        ShowCardSkeleton/
```

Tests (Vitest) live next to the code they cover. They test pure functions and hooks (`renderHook`), not Mantine rendering.

Goal of the architecture: minimize the human effort to build **and maintain** the system. When in doubt, choose the option that makes the code easier to change later: more small files, clearer abstractions.
