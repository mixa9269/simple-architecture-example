---
description: Simple Architecture on the backend (Express in server/) — thin routes, tasks with the business logic, in-memory entities, the TVmaze abstraction, and what lives on the frontend vs the backend
paths:
  - "server/**"
  - "shared/**"
---

# Backend: `server/`

The same layers as on the frontend, without the View. The Express routes take the presenter's role: a bridge between the transport (HTTP) and the tasks.

```
server/
  tsconfig.json                # ~/ = server/src/, ~shared/ = shared/
  src/
    index.ts                   # createApp().listen(PORT)
    app.ts                     # express(), cors, json, routes, 404
    routes/                    # HTTP only: parse input → call a task → sendResult
      showsRoutes.ts, favoritesRoutes.ts, parseShowsQuery.ts, sendResult.ts
    tasks/                     # business logic: verb-named arrow functions (see sa-tasks-layer.md)
      loadCached.ts            # loadCached(key, load): the 5-minute cache (inner helper, throws)
      searchShows/             # find → filter by genre → paginate
      getFavorites.ts, toggleFavorite.ts
    lib/
      taskResult.ts            # TaskError kinds + success / badRequest / failure (result builders, not tasks)
    entities/                  # in-memory data + the functions that update it
      cache.ts                 # const cache = {}
      favorites.ts             # const favorite = {}
    tvmaze/                    # the external API: tvmaze.ts (API object), requestTvmaze (transport), mapShow, raw types
shared/
  api.ts                       # the API contract (types only), imported by both sides
```

## Layers

- **Routes** are thin: parse → task → `sendResult`. `parseX` helpers return a result too (`badRequest(message)` = kind `bad-request`).

  ```ts
  showsRoutes.get('/', async (req, res) => {
    const query = parseShowsQuery(req.query);
    sendResult(res, query.ok ? await searchShows(query.data) : query);
  });
  ```

  `sendResult` sends `data` as JSON, or maps the error kind to a status: `bad-request` 400, `not-found` 404, `unavailable` 502, `unexpected` 500. A JSON fallback error handler in `app.ts` catches only bugs.
- **Tasks** hold the business rules: caching to save calls to the external API, genre filtering, pagination, add/remove favorites. They follow `sa-tasks-layer.md`: arrow functions, `try { await tvmaze.shows.get(id) } catch (error) { return failure(error) }`, and they return `{ ok, data }` / `{ ok: false, error: TaskError }`. `failure` logs and names the **kind** of failure, not an HTTP status. **They never import `express`/`cors`**. They don't know they are behind HTTP (ESLint `simple-architecture/server-tasks`).
- **The cache** is a business rule, so it is an inner helper task, not part of the API object: `loadCached('show:' + id, () => tvmaze.shows.get(id))`.
- **Entities** are module-level objects (`const cache = {}`, `const favorite = {}`) with small read/write functions. No database yet: the data lives in the server's memory and is gone after a restart. Tests-only `clearX()` functions reset them.
- **External APIs** go through an API object (`tvmaze.shows.search/get`, see `sa-api-layer.md`) over a transport (`requestTvmaze`). Raw API objects are mapped to our types (`mapShow`) before they leave `tasks/`.
- Time-based rules take `Date.now()` in the task and store timestamps in the entity, so tests can use fake timers.

## Dependency direction

`index.ts → app.ts → routes/ → tasks/ → entities/ · tvmaze/ · lib/` — never backwards (see `sa-dependencies.md`):

- `tasks/` don't import `routes/`, `express`, `cors` or the transport `requestTvmaze` (ESLint `deps-server-tasks`).
- `entities/` and `tvmaze/` don't import `tasks/` or `routes/` (`deps-server-entities`).
- `lib/` doesn't import `tasks/`, `routes/` or `entities/` (`deps-server-lib`).
- No import cycles (`import-x/no-cycle`).

Routes ↔ tasks is a contract too: a route passes parsed input and gets a `TaskResult`; how the task gets the data (cache, TVmaze) is hidden behind it.

## Frontend vs backend

| Frontend (`src/`) | Backend (`server/`) |
|---|---|
| The field, debounce, request objects, cancellation (`AbortController`) | Talking to TVmaze, the 5-minute cache |
| URL state, which genre/page the user picked | Genre filtering, pagination, clamping the page, dropping an unknown genre |
| Toasts, drawers, loading/disabled states | Favorites: what is a favorite, add vs remove (`POST /api/favorites/:id/toggle`), the order |
| A mirror of server data in the store | The source of truth |

When in doubt: rules about **data** (what is returned, what is stored, what is allowed) go to the server. Rules about **presentation and interaction** stay in the frontend.

## The contract

- `shared/api.ts` holds only types (`Show`, `ShowsPage`, `FavoritesAnswer`, `ToggleFavoriteAnswer`, `ApiError`). Import it with `import type … from '~shared/api'`, so nothing resolves it at runtime.
- Change the contract first, then both sides. `tsc -b` checks both.

## Conventions

- Same rules as the frontend: max 120 lines per file, `./` for the own folder, `~/` (= `server/src/`) for everything else, never `../`.
- Tests (Vitest, `node` environment) live next to the code: tasks with a stubbed global `fetch` (check `result.ok` / `result.data`; spy on `console.error` in failure cases), routes through `supertest` on `createApp()`.
- Run: `npm run dev:server` (tsx watch, port 3001; Vite proxies `/api` in dev). Production: Render (`render.yaml`), `CORS_ORIGIN` = the Pages origin.
