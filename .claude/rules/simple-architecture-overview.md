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

ESLint enforcement: `eslint/simple-architecture.js` (spread it into `eslint.config.js`).

## Example tree (TV Shows Explorer homework)

```
src/
  main.tsx
  components/                 # globally reusable: Chip, Pagination, Spinner
    Chip/
      Chip.tsx
      usePresenter.ts
      styles.module.css
  App/
    App.tsx
    usePresenter.ts
    styles.module.css
    ShowsExplorer/
      ShowsExplorer.tsx
      usePresenter.ts
      useShowsSearch.ts
      useGenreFilter.ts
      styles.module.css
      SearchInput/
      GenreChips/
      ShowsList/
        ShowCard/
```

Goal of the architecture: minimize the human effort to build **and maintain** the system. When in doubt, choose the option that makes the code easier to change later: more small files, clearer abstractions.
