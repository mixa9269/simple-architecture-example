---
description: Simple Architecture — Tasks (Interactor / use case) hold the business logic as verb-named arrow functions with a contract designed by the presenter; they call api.<domain>.<method>() in try/catch, log errors and return { ok, data | error }; they write the store only for global data
paths:
  - "src/**/tasks/**"
  - "server/src/tasks/**"
---

# Tasks: the business logic

A **task** is what the user asks the app to do: search shows, add a show to favorites, log out. In VIPER it is the **Interactor** (Clean Architecture's use case). Its description has no tools in it, so the code doesn't either.

## The contract comes first

A task and its presenter agree on an interface and both depend only on it (dependency inversion, see `sa-dependencies.md`). **The caller designs it**: "what do I pass, what do I want back?" — `const { shows, genres } = await loadShowsByQuery({ query })`. The task fits that contract and hides *how* (HTTP or cache, sockets, mapping, tokens). While the contract holds, the task and the presenter change independently.

**Returning the data is the default.** The task gives the data back; the presenter keeps it in `useState` (see `sa-entities.md`: the data of one screen is not stored globally). A task writes the store **only for global data** — `toggleFavorite` → `favoritesReceived(list)`, because the favorites are read all over the app.

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

- A task is an **arrow function**, usually `async`: `export const toggleFavorite = async (showId: number) => {…}`.
- **Named with a verb**: `searchShows`, `toggleFavorite`, `loadFavorites`, `logout`. File name = function name.
- **One task = one exported function.** When it outgrows 120 lines, it becomes a folder (`tasks/searchShows/searchShows.ts` + helpers), but from outside it is still one call. Helpers in a tasks folder are arrow functions too.
- It calls servers through the **API object** inside `try`: `await api.favorites.toggle(id)` (see `sa-api-layer.md`).
- In `catch` it **logs** the error (`console.error`) and **reports** it. It never swallows it: the caller must know the task failed.
- It **returns a result**, `TaskResult<T>` from `~shared/taskResult`: `{ ok: true, data }` or `{ ok: false, error }`. Build it with the helpers in `src/lib/taskResult.ts` (`server/src/lib/taskResult.ts` on the server):
  - `success(data)`;
  - `failure(error, signal?)`: logs (except for a cancelled request) and returns the error message.

  These helpers are **not tasks**: they don't do anything the user asked for, they only build a result. So they live in `lib/`, not in `tasks/`, and they are named with nouns, not verbs.

```ts
// FavoriteStar/logic/tasks/toggleFavorite.ts
export const toggleFavorite = async (showId: number): Promise<TaskResult<ToggleResult>> => {
  try {
    const answer = await api.favorites.toggle(showId);
    store.dispatch(favoritesReceived(answer.favorites));
    return success({ show: answer.show, isFavorite: answer.isFavorite });
  } catch (error) {
    return failure(error);
  }
};
```

The presenter branches on the result (see `sa-presenter-layer.md`):

```ts
const result = await toggleFavorite(show.id);
notifications.show(result.ok ? getToggleToast(result.data.show, result.data.isFavorite) : getErrorToast(result.error));
```

**Entry tasks** (called by a presenter or a route) return a result. **Inner helper tasks**, called only by other tasks (`loadCached` on the server), may throw: the entry task's `catch` handles it.

## What a task may use

- The **API object**: `api.*` on the frontend, `tvmaze.*` on the server.
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
export const toggleFavoriteThunk = (id) => async (dispatch) => { … };  // thunk: can't be awaited for a result
export function toggleFavorite(id) { … }                                // function declaration: use an arrow
export const favorite = async (id) => { … };                            // noun name
try { await api.favorites.toggle(id); } catch (e) { console.error(e); } // swallowed: the caller never learns it failed
await callApi(`/api/favorites/${id}/toggle`, { method: 'POST' });       // transport instead of the API object
catch (error) { notifications.show(…); }                               // UI inside the task
```

## Module state

A task module may keep **non-serializable runtime handles**: the `AbortController` of the load in progress, a debounced function (`debounce(searchShows, 400)` from `~/lib/debounce`). Data goes back to the presenter (or to the store when it is global) — not into module variables.

The example below is today's `loadSearch.ts`. It also writes the search into the store — that part is the known deviation from `sa-entities.md`; the module-handle part is the pattern to keep.

```ts
// ShowsExplorer/tasks/loadSearch.ts
let current: AbortController | null = null;

export const loadSearch = async (request: SearchRequest) => {
  current?.abort();
  const controller = (current = new AbortController());
  store.dispatch(requestStarted(request));
  try {
    const result = await api.shows.search(request, controller.signal);
    if (!controller.signal.aborted) store.dispatch(answerReceived({ request, result, error: null }));
    return success(result);
  } catch (error) {
    /* failure(error, controller.signal) + store the error answer unless aborted */
  }
};
```

## Location

Same idea as `components/` (see `sa-reusable-components.md`):

- Used by one component → `Component/logic/tasks/`.
- Reused by several components of one subtree → a `tasks/` folder at the level of their nearest common ancestor, next to its `logic/`: `ShowsExplorer/tasks/` (`typeQuery`, `selectGenre`, `selectPage`, `retrySearch`, `restoreSearch`, inner `loadSearch`) is used by `SearchInput`, `GenreChips`, `ResultsStatus`, `ResultsPagination` and `ShowsExplorer`. Only components **below** that level import from it.
- Reused across the app → global `src/tasks/`.
- Backend tasks → `server/src/tasks/` (see `sa-backend.md`).

A `tasks/` folder holds **only tasks**, the helpers they are split into (`tasks/searchShows/paginate.ts`) and their tests/test utils (`searchTestUtils.ts`). Plumbing that is not a use case (result builders, small utilities shared by many layers) goes to `lib/`: `src/lib/`, `server/src/lib/`.
