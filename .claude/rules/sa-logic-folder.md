---
description: Simple Architecture — a component's JS logic lives in its logic/ folder (presenter, hooks, helpers) with logic/tasks/ for its business logic
paths:
  - "src/**/*"
---

# `logic/` folder: everything that is not JSX

A component is JSX (View) plus JS logic around it. The JSX stays in the component folder; **all JS logic goes to `logic/`**. Open any component and its logic is always in the same place.

```
ProductCard/
  ProductCard.tsx           # View — JSX only
  types.ts                  # Props + other types of the component
  styles.module.css
  logic/                    # only if the component has logic
    usePresenter.ts         # Presenter: the bridge between the View and the tasks
    useQuantity.ts          # smaller hooks of the presenter
    formatPrice.ts          # pure helpers
    formatPrice.test.ts     # tests next to the code they cover
    tasks/                  # only if the component has tasks (business logic)
      addToCart.ts          # one task = one function
      checkout/             # a task that outgrew 120 lines: a folder, still one exported function
        checkout.ts
        buildOrder.ts
  ChildComponent/           # child components stay next to logic/, not inside it
```

- No logic → no `logic/` folder (static components are plain JSX, see `sa-view-layer.md`).
- No tasks → no `logic/tasks/`.
- `types.ts` stays in the component folder: it describes the component (its `Props`), View and logic both use it.
- `logic/` never contains components or CSS.

## Imports

- The View imports its presenter as `./logic/usePresenter` (ESLint forbids `./usePresenter`).
- Files in `logic/` import each other and `logic/tasks/` relatively (`./formatPrice`, `./tasks/addToCart`).
- `logic/` is a subfolder, so the component's own `types.ts` is "outside" for it: import it via `~/` — `import type { Props } from '~/App/Shop/ProductList/ProductCard/types'`. The `../` ban stays (see `sa-imports.md`).

## Reusable tasks

A task used by one component lives in that component's `logic/tasks/`. A task used by several components of one subtree goes to a `tasks/` folder of their nearest common ancestor, next to its `logic/` (e.g. `Catalog/tasks/`); app-wide ones go to `src/tasks/` (same idea as `components/`, see `sa-reusable-components.md`). When its users shrink back to one, move it back.

## Bad

```
ProductCard/
  usePresenter.ts           # presenter next to the View instead of logic/
  logic/ProductImage.tsx    # a component inside logic/
  logic/types.ts            # Props hidden in logic/
src/tasks/addToCart.ts      # a single-use task in the global folder
```
