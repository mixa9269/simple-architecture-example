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

A task used by one component lives in its `logic/tasks/`. A task reused by several components goes to a `tasks/` folder of their nearest common ancestor (e.g. `Catalog/tasks/`, used only below it), or to the global `src/tasks/` when reused across the app (see `sa-tasks-layer.md`). A reusable component keeps its own tasks inside it: `App/components/AddToCartButton/logic/tasks/addToCart.ts` is used only by `AddToCartButton`, even though the button itself is used in two places.

## Good

```
src/
  components/
    Chip/                     # used by CategoryChips and ProductCard
  App/
    components/
      AddToCartButton/        # used by ProductCard and WishlistItem, both below App
    Wishlist/WishlistItem/
    Shop/
      components/
        ProductImage/         # used by ProductCard and ProductDetails, both below
      ProductList/ProductCard/
      ProductDetails/
```

## Bad

```
src/components/
  ShopHeader/                 # used only once — belongs in Shop/
App/Shop/ProductList/ProductCard/ProductCard.tsx
  → import { Chip } from '~/App/Settings/components/Chip/Chip'  # sideways import
```
