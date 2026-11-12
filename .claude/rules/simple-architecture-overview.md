---
description: Simple Architecture (React) — overview of the rules every component in this project must follow
---

# Simple Architecture — overview

This project follows **Simple Architecture**, a React architecture inspired by *Clean Architecture* and iOS **VIPER** (View, Interactor, Presenter, Entity, Router).

Lesson 1 covers only **View** and **Presenter**. Interactor, Entity and Router come in later lessons — do not invent them yet; put all logic in the Presenter layer.

## Rules

| Rule | File |
|---|---|
| A component is View only: JSX + `usePresenter(props)`; no logic → no presenter, texts right in JSX | `sa-view-layer.md` |
| All logic lives in `usePresenter` and smaller hooks/functions; it takes props whole; no `setState` in render, requests as objects + `AbortController` | `sa-presenter-layer.md` |
| Max **120 lines** per file (ESLint `max-lines`) | `sa-file-size-120.md` |
| Each component has its own folder (View, `usePresenter.ts` if logic, `types.ts` with `Props`, one or more `*.module.css`); single-use children nest inside the parent; folders mirror the UI | `sa-component-tree.md` |
| Own folder and own children via `./`, anything further via `~/` (= `src/`), never `../` | `sa-imports.md` |
| `components/` folders hold reusable components only, used only below in the tree | `sa-reusable-components.md` |

Styles: CSS Modules (`styles.module.css`, may be split into several `*.module.css` in one folder) + CSS variables, no preprocessors.

ESLint enforcement: `eslint/simple-architecture.js` (already spread into `eslint.config.js`).

## UI library: Mantine

- Render Mantine components (`TextInput`, `Chip`, `Pagination`, `Card`, `Skeleton`, …) directly in the View.
- Mantine hooks (`useDisclosure`, …) are hooks — call them only in a presenter.
- Homework logic is hand-written: data fetching (no `useQuery`), debounce, pagination, URL state. Don't use `useDebouncedValue` / `usePagination` from `@mantine/hooks` for it.
- Style with `className` / `classNames` + CSS Modules and `--mantine-*` variables, not with computed `style` props.

## Project tree (TV Shows Explorer homework)

```
src/
  main.tsx                     # MantineProvider + <App/> (exempt from View rule)
  theme.ts                     # Mantine createTheme
  index.css                    # global CSS variables
  App/
    App.tsx, styles.module.css   # static header — no presenter
    ShowsExplorer/
      ShowsExplorer.tsx, usePresenter.ts, styles.module.css
      types.ts                 # domain types: Show, SearchRequest, SearchAnswer, TVmaze API
      useSearchQuery.ts        # field + debounce in the handler → request object, retry
      useShowsSearch.ts        # loads the request (AbortController), answer, status
      getSearchStatus.ts, getShownAnswer.ts, searchShows.ts, mapShow.ts
      useSearchSelection.ts    # genre + page, bound to the request object
      buildResultsView.ts, collectGenres.ts, filterByGenre.ts, paginate.ts
      useSearchUrl.ts, searchUrl.ts   # ?q=&genre=&page=
      testFixtures.ts, presenterTestUtils.ts, *.test.ts
      SearchInput/             # each child: View + usePresenter.ts + types.ts + styles
      ResultsStatus/           # + formatSummary.ts
      GenreChips/
      ShowsList/
        ShowCard/
        ShowCardSkeleton/      # no props, no logic → only View + styles
```

Tests (Vitest) live next to the code they cover. They test pure functions and hooks (`renderHook`, including presenters), not Mantine rendering.

Goal of the architecture: minimize the human effort to build **and maintain** the system. When in doubt, choose the option that makes the code easier to change later: more small files, clearer abstractions.
