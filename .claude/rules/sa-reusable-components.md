---
description: Simple Architecture — components/ folders contain only reusable components, used only below that folder in the tree
paths:
  - "src/**/*"
---

# `components/` = reusable only

A folder named `components/` is a marker: **everything inside is reused in more than one place**. Single-use components never go there (see `sa-component-tree.md`).

- **Global:** `src/components/` — reused across the whole app (`Chip`, `Pagination`, `Spinner`, `Modal`).
- **Local:** a `components/` folder may exist at any level of the tree. Its components are reusable **only below that level**.

Components inside `components/` follow the same folder structure (`Chip/Chip.tsx`, `usePresenter.ts`, `styles.module.css`).

## Import direction

A component may import from a `components/` folder that sits in one of its **ancestor** folders (or `src/components/`). Never import from a `components/` folder in a sibling or deeper branch — move the component up to the nearest common ancestor's `components/` instead.

## When to move a component into `components/`

1. It is used in a second place → move it to the `components/` of the nearest common ancestor of both users.
2. Its users later shrink back to one → move it back into that user's folder.

Benefit: deleting a subtree also deletes the reusable components only it used.

## Good

```
src/
  components/
    Chip/                     # used by GenreChips and ShowCard
  App/ShowsExplorer/
    components/
      ShowPoster/             # used by ShowCard and ShowDetails, both below
    ShowsList/ShowCard/
    ShowDetails/
```

## Bad

```
src/components/
  ShowsExplorerHeader/        # used only once — belongs in ShowsExplorer/
App/ShowsExplorer/ShowsList/ShowCard/ShowCard.tsx
  → import { Chip } from '../../../Settings/components/Chip/Chip'  # sideways import
```
