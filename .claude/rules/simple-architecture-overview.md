# Simple Architecture — overview

This project follows **Simple Architecture**, a React architecture inspired by *Clean Architecture* and iOS **VIPER**:

| Letter | Layer | In this project |
|---|---|---|
| **V** | View | the component: JSX + `usePresenter(props)` |
| **I** | Interactor = use case = **Task** | plain verb-named functions in `logic/tasks/` (or `src/tasks/` when reused); the business logic |
| **P** | Presenter | `logic/usePresenter.ts` + hooks: calls tasks, keeps the screen's data from them, UI state, handlers, toasts/navigation |
| **E** | Entity | the Redux Toolkit store in `src/entities/`: global data only, get/set |
| **R** | Router | navigation is environment-specific, so it stays in the presenter (no own layer) |

The app has its own **backend** (`server/`, Express) with the same idea: thin routes → tasks → in-memory entities.

**Dependencies point one way** — display depends on business logic, code that changes often on code that changes rarely, no cycles; neighbouring layers talk through contracts (see `sa-dependencies.md`):

```
main.tsx → View → Presenter → Tasks → Store        Tasks → api.* → callApi        all → lib/, ~shared/
```

## Rules

| Rule | File |
|---|---|
| Direction of dependencies: often-changed code depends on rarely-changed code; View → Presenter → Tasks → Store; no cycles; contracts between layers (dependency inversion); per-layer import bans | `sa-dependencies.md` |
| A component is View only: JSX + `usePresenter(props)`; no logic → no presenter, texts right in JSX | `sa-view-layer.md` |
| The presenter is the bridge between the View and the tasks: calls tasks, keeps their data in `useState` and passes it down as props, returns ready-to-render values; reads only global data from the store; takes props whole; no `setState` in render | `sa-presenter-layer.md` |
| All JS logic of a component lives in its `logic/` folder; tasks in `logic/tasks/` | `sa-logic-folder.md` |
| A task = verb-named arrow function with a contract designed by its caller: `try { await api.x.y() } catch { log }` → returns `{ ok, data \| error }`; no React, no UI library, no display imports; writes the store only for global data | `sa-tasks-layer.md` |
| Servers are called through an API object `api.<domain>.<method>()` (`tvmaze.*` on the server): thin typed arrows, only tasks call it | `sa-api-layer.md` |
| Entities = Redux Toolkit store for global data only (favorites), get/set, no logic; minimize what is stored and who reads it; loading, errors and a screen's data stay in its presenter | `sa-entities.md` |
| Backend: thin Express routes, tasks without `express`, `const cache = {}` / `const favorite = {}` entities; data rules on the server, presentation on the client | `sa-backend.md` |
| Max **120 lines** per file (ESLint `max-lines`), frontend and backend | `sa-file-size-120.md` |
| Each component has its own folder (View, `types.ts` with `Props`, `*.module.css`, `logic/`); single-use children nest inside the parent; folders mirror the UI | `sa-component-tree.md` |
| Own folder and own children via `./`, anything further via `~/` (= `src/` or `server/src/`), the contract via `~shared/`, never `../` | `sa-imports.md` |
| `components/` folders hold reusable components only, used only below in the tree (same for `src/tasks/`) | `sa-reusable-components.md` |

Styles: CSS Modules (`styles.module.css`, may be split into several `*.module.css` in one folder) + CSS variables, no preprocessors.

ESLint enforcement: `eslint/simple-architecture.js` + `eslint/simple-architecture-dependencies.js` (layer import bans, `import-x/no-cycle`), spread into `eslint.config.js`.

## UI library: Mantine

- Render Mantine components (`TextInput`, `Chip`, `Pagination`, `Card`, `Drawer`, …) directly in the View.
- Mantine hooks (`useDisclosure`, …) and `notifications.show` are UI: call them only in a presenter, never in a task.
- Homework logic is hand-written: data fetching (no `useQuery`), debounce, URL state. Don't use `useDebouncedValue` / `usePagination` from `@mantine/hooks` for it.
- Style with `className` / `classNames` + CSS Modules and `--mantine-*` variables, not with computed `style` props.

## Project tree (TV Shows Explorer)

```
shared/api.ts                  # API contract types: Show, ShowsPage, FavoritesAnswer, ToggleFavoriteAnswer
shared/taskResult.ts           # TaskResult<T, E> = { ok: true, data } | { ok: false, error }
server/src/                    # backend, see sa-backend.md
  app.ts, index.ts, routes/, tasks/, lib/, entities/, tvmaze/ (tvmaze.ts = API object)
src/
  main.tsx                     # Provider(store) + MantineProvider + Notifications + <App/> (exempt from View rule)
  theme.ts, index.css
  api/                         # api.ts = { shows, favorites } over callApi.ts (transport)
  lib/taskResult.ts            # success / failure: builds the result of every task (not a task)
  lib/debounce.ts              # hand-written debounce with cancel (a utility, not a task)
  entities/                    # store.ts, favorites/ (slice) — global data
                               #   search/ — KNOWN DEVIATION: not global, due to move into ShowsExplorer's presenter
  testUtils/                   # fixtures, renderHookWithStore
  App/
    App.tsx, styles.module.css # static layout — no presenter
    components/FavoriteStar/   # reused by ShowCard and FavoriteItem
      FavoriteStar.tsx, types.ts, styles.module.css
      logic/usePresenter.ts, getToggleToast.ts, tasks/toggleFavorite.ts
    FavoritesButton/           # header button with the count + Drawer
      logic/usePresenter.ts, tasks/loadFavorites.ts
      FavoritesList/           # keepUnstarred: an unstarred show stays until the Drawer is reopened
        FavoriteItem/
    ShowsExplorer/
      ShowsExplorer.tsx, styles.module.css   # layout only
      logic/
        usePresenter.ts, useSearchUrl.ts, searchUrl.ts   # restore from / sync to ?q=&genre=&page=
      tasks/                   # search tasks used by the children below
        typeQuery.ts           # field text → store; debounced searchShows; empty field clears
        searchShows.ts, selectGenre.ts, selectPage.ts, retrySearch.ts, restoreSearch.ts
        loadSearch.ts          # inner: AbortController, requestStarted / answerReceived
        searchTestUtils.ts, *.test.ts
      SearchInput/, GenreChips/, ResultsPagination/   # read the search slice (known deviation, see sa-entities.md)
      ResultsStatus/           # + useIsSlow: "waking up the server" after 3 s
      ShowsList/
        ShowCard/
        ShowCardSkeleton/      # no props, no logic → only View + styles
```

Tests (Vitest) live next to the code they cover: pure functions, hooks and presenters (`renderHook`), tasks with a stubbed `fetch`. No tests of Mantine rendering. Two Vitest projects: `web` (jsdom, `src/`) and `server` (node, `server/`).

Goal of the architecture: minimize the human effort to build **and maintain** the system. When in doubt, choose the option that makes the code easier to change later: more small files, clearer abstractions.
