---
description: Simple Architecture — one folder per component, single-use children nested in the parent, folders mirror the UI
paths:
  - "src/**/*"
---

# Tree-shaped component folders

Every component has **its own folder**:

```
ProductCard/
  ProductCard.tsx       # View — file name = folder name (PascalCase)
  types.ts              # Props + other types of this component — only if it has any
  styles.module.css     # CSS Module(s)
  logic/                # only if the component has logic (see sa-logic-folder.md)
    usePresenter.ts     # Presenter + smaller hooks + helpers + tests
    tasks/              # business logic of this component (see sa-tasks-layer.md)
```

`types.ts` exports the props interface named simply `Props` and any other types the component owns. View and Presenter both import it: `import type { Props } from './types'`.

- Types shared by several components go to the `types.ts` of their nearest common ancestor (e.g. `Product` in `Shop/types.ts`).
- A parent rarely needs a child's props type; when it does, rename on import: `import type { Props as ProductCardProps } from './ProductCard/types'`.
- A component without props and without own types has no `types.ts`; a component without logic has no `logic/`.

A component used in **only one place** lives **inside the folder of the component that uses it**. Nesting depth is unlimited — the folder tree should mirror what the user sees on screen, so you can find any component by walking the UI.

Import with the duplicated name: `import { ProductCard } from './ProductCard/ProductCard';` (no `index.tsx` files). Imports from outside the own folder go through `~/` (see `sa-imports.md`).

## Styles

- Use plain **CSS Modules** (`*.module.css`), next to the component.
- One `styles.module.css` by default. If it grows while the JSX does not need splitting, split the styles into several files in the same folder (`styles.module.css`, `gallery.module.css`).
- Use **CSS variables** for shared values (colors, spacing) — no Sass/Less/Stylus.

## Good

```
App/
  App.tsx                 # static layout — no logic/
  styles.module.css
  CartButton/             # header button
    CartButton.tsx
    logic/
      usePresenter.ts
      tasks/loadCart.ts
    CartList/             # used only by CartButton → lives inside it
  Shop/
    Shop.tsx              # layout: passes props down
    types.ts              # types shared by the subtree
    logic/
      usePresenter.ts     # owns the screen's state, builds the children's props
      tasks/loadProducts.ts
    SearchField/
      SearchField.tsx
      types.ts            # Props: value, onChange
      styles.module.css
      logic/usePresenter.ts
    ProductList/
      ProductList.tsx
      types.ts
      logic/usePresenter.ts
      ProductCard/
        ProductCard.tsx
        types.ts
        logic/usePresenter.ts
      ProductCardSkeleton/
        ProductCardSkeleton.tsx   # no props, no logic
        styles.module.css
```

## Bad

```
src/
  components/ProductCard.tsx       # single-use component in a shared folder
  hooks/useProducts.ts             # logic separated from its component
  ProductList/index.tsx            # index.tsx instead of ProductList.tsx
  ProductList/usePresenter.ts      # presenter outside logic/
  ProductList/logic/usePresenter.ts  # exporting Props (the props type belongs in types.ts)
  styles/ProductList.scss          # preprocessor, styles away from component
```
