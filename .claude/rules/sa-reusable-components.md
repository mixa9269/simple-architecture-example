---
description: Simple Architecture — components/ folders contain only reusable components, used only below that folder in the tree
paths:
  - "src/**/*"
---

# `components/` = reusable only

A folder named `components/` is a marker: **everything inside is reused in more than one place**. Single-use components never go there (see `sa-component-tree.md`).

- **Global:** `src/components/` — reused across the whole app (`Chip`, `Pagination`, `Spinner`, `Modal`).
- **Local:** a `components/` folder may exist at any level of the tree. Its components are reusable **only below that level**.

Components inside `components/` follow the same folder structure (`Chip/Chip.tsx`, `types.ts`, `styles.module.css`, `logic/`).

## Import direction

A component may import from a `components/` folder that sits in one of its **ancestor** folders (or `src/components/`). Never import from a `components/` folder in a sibling or deeper branch — move the component up to the nearest common ancestor's `components/` instead.

## When to move a component into `components/`

1. It is used in a second place → move it to the `components/` of the nearest common ancestor of both users.
2. Its users later shrink back to one → move it back into that user's folder.

Benefit: deleting a subtree also deletes the reusable components only it used.

## The same idea for tasks

A task used by one component lives in its `logic/tasks/`. A task reused by several components goes to a `tasks/` folder of their nearest common ancestor (`ShowsExplorer/tasks/`, used only below it), or to the global `src/tasks/` when reused across the app (see `sa-tasks-layer.md`). A reusable component keeps its own tasks inside it: `App/components/FavoriteStar/logic/tasks/toggleFavorite.ts` is used only by `FavoriteStar`, even though `FavoriteStar` itself is used in two places.

## Good

```
src/
  components/
    Chip/                     # used by GenreChips and ShowCard
  App/
    components/
      FavoriteStar/           # used by ShowCard and FavoriteItem, both below App
    FavoritesButton/FavoritesList/FavoriteItem/
    ShowsExplorer/
      components/
        ShowPoster/           # used by ShowCard and ShowDetails, both below
      ShowsList/ShowCard/
      ShowDetails/
```

## Bad

```
src/components/
  ShowsExplorerHeader/        # used only once — belongs in ShowsExplorer/
App/ShowsExplorer/ShowsList/ShowCard/ShowCard.tsx
  → import { Chip } from '~/App/Settings/components/Chip/Chip'  # sideways import
```
