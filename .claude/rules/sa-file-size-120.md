---
description: Simple Architecture — hard limit of 120 lines per file, enforced by ESLint max-lines
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "server/**/*.ts"
  - "shared/**/*.ts"
---

# Max 120 lines per file

No source file may exceed **120 lines** (blank lines and comments count), on the frontend and on the backend. It is enforced by `max-lines` in `eslint/simple-architecture.js`. Aim for ~70 lines; small files read like a book's table of contents.

Never silence it with `eslint-disable max-lines` or by squeezing code onto fewer lines.

## When a file approaches the limit

1. **Presenter too big** → extract a concern into its own hook (`logic/useX.ts`) next to it.
2. **Pure logic inside a hook** (formatting, mapping, deciding a status) → extract into a plain function file (`logic/formatPrice.ts`).
3. **Business logic inside a hook** (server calls, store writes) → extract a task (`logic/tasks/addToCart.ts`).
4. **Task too big** → turn it into a folder (`tasks/checkout/checkout.ts` + helpers), still one exported function.
5. **JSX too big** → extract a child component into a nested folder (see `sa-component-tree.md`).
6. **Types too big** → move them to `types.ts` in the same folder.
7. **Route too big** (backend) → move parsing to `parseX.ts` and the logic to a task.
8. **CSS too big** → if the JSX does not need splitting, split the styles into several `*.module.css` files in the same folder; if it does, extract a child component.

## Good / Bad

- **Bad:** one `ProductPage.tsx` with markup, state, effects, requests and formatting inline — it grows past the limit and reads like one long scroll.
- **Good:** the same page split by meaning — `ProductPage.tsx` (markup), `logic/usePresenter.ts` (wires things up), `logic/useCart.ts` (one concern), `logic/formatPrice.ts` (pure), `logic/tasks/addToCart.ts` (business). Each file says one thing, and its name says which.
