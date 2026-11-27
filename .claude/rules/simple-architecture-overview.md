# Simple Architecture — overview

This project follows **Simple Architecture**, a React architecture inspired by *Clean Architecture* and iOS **VIPER**:

| Letter | Layer | In this project |
|---|---|---|
| **V** | View | the component: JSX + `usePresenter(props)` |
| **I** | Interactor = use case = **Task** | plain verb-named functions in `logic/tasks/` (or `src/tasks/` when reused); the business logic |
| **P** | Presenter | `logic/usePresenter.ts` + hooks: calls tasks, keeps the screen's data from them, UI state, handlers, toasts/navigation |
| **E** | Entity | the Redux Toolkit store in `src/entities/`: global data only, get/set |
| **R** | Router | `react-router` (`HashRouter`): pages are route components; navigation and URL state are environment-specific, so they stay in the presenter layer (no own layer) |

The app has its own **backend** (`server/`, Express) with the same idea: thin routes → tasks → in-memory entities.

**Dependencies point one way** — display depends on business logic, code that changes often on code that changes rarely, no cycles; neighbouring layers talk through contracts (see `sa-dependencies.md`):

```
main.tsx → View → Presenter → Tasks → Store        Tasks → api.* → callApi        all → lib/, ~shared/
```

## Rules

| Rule | File |
|---|---|
| Direction of dependencies: often-changed code depends on rarely-changed code; View → Presenter → Tasks → Store; no cycles; contracts between layers (dependency inversion); per-layer import bans | `sa-dependencies.md` |
| Routing: pages as route components under `App/`, `HashRouter`; `useNavigate` / `useLocation` / `useSearchParams` only in the presenter layer; tasks never navigate | `sa-routing.md` |
| A component is View only: JSX + `usePresenter(props)`; no logic → no presenter, texts right in JSX | `sa-view-layer.md` |
| The presenter is the bridge between the View and the tasks: calls tasks, keeps their data in `useState` and passes it down as props, returns ready-to-render values; reads only global data from the store; takes props whole; no `setState` in render | `sa-presenter-layer.md` |
| All JS logic of a component lives in its `logic/` folder; tasks in `logic/tasks/` | `sa-logic-folder.md` |
| A task = verb-named arrow function with a contract designed by its caller: `try { await api.x.y() } catch { log }` → returns `{ ok, data \| error }`; no React, no UI library, no display imports; writes the store only for global data | `sa-tasks-layer.md` |
| Servers are called through an API object `api.<domain>.<method>()` (`tvmaze.*` on the server): thin typed arrows, only tasks call it | `sa-api-layer.md` |
| Entities = Redux Toolkit store for global data only (the session and the favorites), get/set, no logic; minimize what is stored and who reads it; loading, errors and a screen's data stay in its presenter | `sa-entities.md` |
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

## Where things live

The rules describe patterns; the code itself is the map. Read the folders instead of relying on a list here.

- `src/App/` — the component tree; folders mirror the UI (`sa-component-tree.md`).
- `src/api/` — the API object over `callApi`; `src/entities/` — the store (global data only); `src/lib/` — plumbing that is not a task.
- `server/src/` — routes → tasks → entities, plus one folder per external API (`sa-backend.md`).
- `shared/` — types both sides share: the API contract and `TaskResult`.
- `eslint/` — the enforced part of these rules.

Reference implementations worth copying: a screen that owns its data — `src/App/ShowsExplorer/logic/`; global data with a task writing the store — the favorites (`src/entities/favorites/`, `FavoriteStar`); the session and a page with redirects — `src/entities/session/`, `src/tasks/`, `src/App/LoginPage/`.

Tests (Vitest) live next to the code they cover: pure functions, hooks and presenters (`renderHook`), tasks with a stubbed `fetch`. No tests of Mantine rendering. Two Vitest projects: `web` (jsdom, `src/`) and `server` (node, `server/`).

Goal of the architecture: minimize the human effort to build **and maintain** the system. When in doubt, choose the option that makes the code easier to change later: more small files, clearer abstractions.
