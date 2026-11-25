---
description: Simple Architecture — Tasks (Interactor / use case) hold the business logic as verb-named arrow functions with a contract designed by the presenter; they call api.<domain>.<method>() in try/catch, log errors and return { ok, data | error }; they write the store only for global data
paths:
  - "src/**/tasks/**"
  - "server/src/tasks/**"
---

# Tasks: the business logic

A **task** is what the user asks the app to do: search products, add a product to the cart, log out. In VIPER it is the **Interactor** (Clean Architecture's use case). Its description has no tools in it, so the code doesn't either.

## The contract comes first

A task and its presenter agree on an interface and both depend only on it (dependency inversion, see `sa-dependencies.md`). **The caller designs it**: "what do I pass, what do I want back?" — `const { products, categories } = await loadProducts({ query })`. The task fits that contract and hides *how* (HTTP or cache, sockets, mapping, tokens). While the contract holds, the task and the presenter change independently.

**Returning the data is the default.** The task gives the data back; the presenter keeps it in `useState` (see `sa-entities.md`: the data of one screen is not stored globally). A task writes the store **only for global data** — `addToCart` → `cartReceived(items)`, because the cart is read all over the app (the counter in the header, the buttons on every card).

```ts
// HomePage/logic/tasks/loadHomePageVideos.ts — contract: nothing in, TaskResult<Video[]> out
export const loadHomePageVideos = async (): Promise<TaskResult<Video[]>> => {
  try {
    return success(await api.videos.listRecommended());
  } catch (error) {
    return failure(error);
  }
};
```

## Shape

- A task is an **arrow function**, usually `async`: `export const addToCart = async (productId: number) => {…}`.
- **Named with a verb**: `loadProducts`, `addToCart`, `checkout`, `logout`. File name = function name.
- **One task = one exported function.** When it outgrows 120 lines, it becomes a folder (`tasks/checkout/checkout.ts` + helpers), but from outside it is still one call. Helpers in a tasks folder are arrow functions too.
- It calls servers through the **API object** inside `try`: `await api.cart.add(productId)` (see `sa-api-layer.md`).
- In `catch` it **logs** the error (`console.error`) and **reports** it. It never swallows it: the caller must know the task failed.
- It **returns a result**, `TaskResult<T>` from `~shared/taskResult`: `{ ok: true, data }` or `{ ok: false, error }`. Build it with the helpers in `src/lib/taskResult.ts` (`server/src/lib/taskResult.ts` on the server):
  - `success(data)`;
  - `failure(error, signal?)`: logs (except for a cancelled request) and returns the error message.

  These helpers are **not tasks**: they don't do anything the user asked for, they only build a result. So they live in `lib/`, not in `tasks/`, and they are named with nouns, not verbs.

```ts
// AddToCartButton/logic/tasks/addToCart.ts — writes the store: the cart is global
export const addToCart = async (productId: number): Promise<TaskResult<CartItem>> => {
  try {
    const answer = await api.cart.add(productId);
    store.dispatch(cartReceived(answer.items));
    return success(answer.added);
  } catch (error) {
    return failure(error);
  }
};
```

The presenter branches on the result (see `sa-presenter-layer.md`):

```ts
const result = await addToCart(product.id);
notifications.show(result.ok ? getAddedToast(result.data) : getErrorToast(result.error));
```

**Entry tasks** (called by a presenter or a route) return a result. **Inner helper tasks**, called only by other tasks (e.g. a caching helper on the server), may throw: the entry task's `catch` handles it.

## What a task may use

- The **API object**: `api.*` on the frontend, the external-API object (e.g. `tvmaze.*`) on the server.
- **Stores directly**, for **global data only**: `import { store } from '~/entities/store'`, then `store.dispatch(…)` / `store.getState()` (see `sa-entities.md`). No redux-thunk, redux-saga or other middlemen. Everything else is returned to the presenter.
- Other tasks, pure helpers, `~shared/*` types.
- An `AbortSignal` parameter when the work can be cancelled. Pass it to the API method and to `failure(error, signal)`.

## What a task never does

- **No React**: no hooks, no JSX, no `react`/`react-dom`/`react-redux` imports. A task would survive moving to another UI library.
- **No UI library**: no `@mantine/*`. **Toasts, navigation, focus** depend on the environment, so they belong to the presenter. The task returns what happened and the presenter decides how to show it.
- **No UI state**: loading/disabled flags stay local in the presenter (`useState`). You can `await` a task, so the presenter knows when it finished.
- **No transport**: no `fetch`, no `callApi`/`requestTvmaze`. Only the API object.
- **No imports from display**: no presenters or hooks (`use*`), no Views, nothing from a component's `logic/` — display depends on tasks, not the other way round (see `sa-dependencies.md`). A task that needs a value from the presenter gets it as a parameter.

ESLint (`simple-architecture/tasks`, `server-tasks`, `deps-tasks`, `deps-server-tasks`): React/Mantine imports, display modules, `fetch`, the transports and `function` exports are errors in tasks folders.

## Bad

```ts
export const addToCartThunk = (id) => async (dispatch) => { … };  // thunk: can't be awaited for a result
export function addToCart(id) { … }                                // function declaration: use an arrow
export const cartItem = async (id) => { … };                       // noun name
try { await api.cart.add(id); } catch (e) { console.error(e); }    // swallowed: the caller never learns it failed
await callApi(`/api/cart/${id}`, { method: 'POST' });              // transport instead of the API object
catch (error) { notifications.show(…); }                               // UI inside the task
```

## Module state

A task module may keep **non-serializable runtime handles** when the task itself owns them (e.g. a socket connection it reuses). Data goes back to the presenter (or to the store when it is global) — not into module variables.

Cancellation and debounce of a screen belong to the **owner of the screen's state** — its presenter: it creates the `AbortController`, passes `signal` to the task and ignores an aborted result (see `sa-presenter-layer.md`). The task only takes the `signal` and passes it on:

```ts
// Shop/logic/tasks/loadProducts.ts — contract designed by the presenter: params + signal in
export const loadProducts = async (
  params: ProductQuery,
  signal: AbortSignal,
): Promise<TaskResult<ProductsPage>> => {
  try {
    return success(await api.products.search(params, signal));
  } catch (error) {
    return failure(error, signal);
  }
};
```

## Location

Same idea as `components/` (see `sa-reusable-components.md`):

- Used by one component → `Component/logic/tasks/`.
- Reused by several components of one subtree → a `tasks/` folder at the level of their nearest common ancestor, next to its `logic/` (e.g. `Catalog/tasks/` used by `Catalog/Filters` and `Catalog/List`). Only components **below** that level import from it. Before adding one, check that the state really can't stay in the common ancestor's presenter, calling a single task there.
- Reused across the app → global `src/tasks/`.
- Backend tasks → `server/src/tasks/` (see `sa-backend.md`).

A `tasks/` folder holds **only tasks**, the helpers they are split into (`tasks/checkout/buildOrder.ts`) and their tests/test utils. Plumbing that is not a use case (result builders, small utilities shared by many layers) goes to `lib/`: `src/lib/`, `server/src/lib/`.
