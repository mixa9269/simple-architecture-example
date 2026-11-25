---
description: Simple Architecture — the API object api.<domain>.<method>() (frontend src/api/, server tvmaze.*): thin typed arrow methods over a transport, called only from tasks
paths:
  - "src/api/**"
  - "src/**/tasks/**"
  - "server/src/tvmaze/**"
  - "server/src/tasks/**"
---

# API object: `api.<domain>.<method>()`

A task talks to a server through an **API object**, grouped by domain. The task reads like the use case: `await api.favorites.toggle(id)`. It doesn't say how the request travels (HTTP, headers, base URL, query string).

This is **dependency inversion** for libraries and transports (see `sa-dependencies.md`): the app depends on a small interface of our own (`api.shows.search(query, signal)`), and only one module — the transport `callApi` / `requestTvmaze` — knows `fetch`, URLs and headers. Moving to another HTTP client, adding a token or switching to sockets touches that module only; the tasks, presenters and Views keep working.

## Frontend: `src/api/`

```
src/api/
  callApi.ts       # transport: base URL (VITE_API_URL), fetch, JSON, throws Error(server message)
  shows.ts         # export const shows = { search: (query, signal?) => callApi<ShowsPage>(…) }
  favorites.ts     # export const favorites = { list: (signal?) => …, toggle: (showId) => … }
  api.ts           # export const api = { shows, favorites }
```

```ts
// src/api/favorites.ts
export const favorites = {
  list: (signal?: AbortSignal) => callApi<FavoritesAnswer>('/api/favorites', { signal }),
  toggle: (showId: number) =>
    callApi<ToggleFavoriteAnswer>(`/api/favorites/${showId}/toggle`, { method: 'POST' }),
};
```

## Server: `server/src/tvmaze/`

The same shape for the external API: `tvmaze.ts` exports `tvmaze = { shows: { search, get } }` over the transport `requestTvmaze`. Caching is a business rule, so it is **not** here: tasks wrap a call in `loadCached(key, () => tvmaze.shows.get(id))`.

## Rules

- **One file per domain**, assembled in one object (`api.ts` / `tvmaze.ts`). Methods are named by what they do in the domain: `search`, `get`, `list`, `toggle`.
- **Methods are thin arrow functions**: build the path/params, call the transport, return the typed answer (types from `~shared/api` or the raw API types). No business logic, no store, no state.
- **They throw** (the transport throws an `Error` with the server's message) and **catch nothing**. The calling task catches and turns the error into a result (see `sa-tasks-layer.md`).
- They take an `AbortSignal` when the call can be cancelled.
- **Only tasks call the API object.** Presenters and Views never do. Tasks never call the transport (`callApi`, `requestTvmaze`) or `fetch` directly.

ESLint: `fetch` and `~/api/callApi` / `requestTvmaze` are errors in tasks. `function` exports are errors in `src/api/` and `tvmaze.ts`.

## Bad

```ts
await callApi(`/api/favorites/${id}/toggle`, { method: 'POST' });   // in a task: use api.favorites.toggle(id)
await fetch('https://api.tvmaze.com/shows/1');                        // in a task: use tvmaze.shows.get(1)
export const favorites = { toggle: async (id) => { try { … } catch { … } } }; // catching in the API layer
export function list() { … }                                          // function declaration
```
