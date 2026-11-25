---
description: Simple Architecture — the API object api.<domain>.<method>() (frontend src/api/, server tvmaze.*): thin typed arrow methods over a transport, called only from tasks
paths:
  - "src/api/**"
  - "src/**/tasks/**"
  - "server/src/tvmaze/**"
  - "server/src/tasks/**"
---

# API object: `api.<domain>.<method>()`

A task talks to a server through an **API object**, grouped by domain. The task reads like the use case: `await api.cart.add(id)`. It doesn't say how the request travels (HTTP, headers, base URL, query string).

This is **dependency inversion** for libraries and transports (see `sa-dependencies.md`): the app depends on a small interface of our own (`api.products.search(query, signal)`), and only one module — the transport `callApi` / `requestTvmaze` — knows `fetch`, URLs and headers. Moving to another HTTP client, adding a token or switching to sockets touches that module only; the tasks, presenters and Views keep working.

## Frontend: `src/api/`

```
src/api/
  callApi.ts       # transport: base URL, fetch, JSON, throws Error(server message)
  <domain>.ts      # one file per domain: export const products = { search: (query, signal?) => … }
  api.ts           # export const api = { products, cart, … }
```

```ts
// src/api/cart.ts
export const cart = {
  list: (signal?: AbortSignal) => callApi<CartAnswer>('/api/cart', { signal }),
  add: (productId: number) => callApi<AddToCartAnswer>(`/api/cart/${productId}`, { method: 'POST' }),
};
```

## Server: an external API

The same shape for an external API the server calls: one folder per API (in this repo `server/src/tvmaze/`) with an API object (`tvmaze.shows.get(id)`) over its own transport. Caching is a business rule, so it is **not** in the API object: a task wraps the call (`loadCached(key, () => tvmaze.shows.get(id))`).

## Rules

- **One file per domain**, assembled in one object (`api.ts` / `tvmaze.ts`). Methods are named by what they do in the domain: `search`, `get`, `list`, `toggle`.
- **Methods are thin arrow functions**: build the path/params, call the transport, return the typed answer (types from `~shared/api` or the raw API types). No business logic, no store, no state.
- **They throw** (the transport throws an `Error` with the server's message) and **catch nothing**. The calling task catches and turns the error into a result (see `sa-tasks-layer.md`).
- They take an `AbortSignal` when the call can be cancelled.
- **Only tasks call the API object.** Presenters and Views never do. Tasks never call the transport (`callApi`, `requestTvmaze`) or `fetch` directly.

ESLint: `fetch` and `~/api/callApi` / `requestTvmaze` are errors in tasks. `function` exports are errors in `src/api/` and `tvmaze.ts`.

## Bad

```ts
await callApi(`/api/cart/${id}`, { method: 'POST' });   // in a task: use api.cart.add(id)
await fetch('https://api.tvmaze.com/shows/1');                        // in a task: use tvmaze.shows.get(1)
export const cart = { add: async (id) => { try { … } catch { … } } }; // catching in the API layer
export function list() { … }                                          // function declaration
```
