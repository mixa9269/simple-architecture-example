---
description: Simple Architecture — direction of dependencies: code that changes often depends on code that changes rarely; display (View, Presenter) depends on business logic (Tasks, Store); no cycles; layers talk through contracts (dependency inversion)
paths:
  - "src/**/*"
  - "server/**/*"
  - "shared/**/*"
---

# Direction of dependencies

A dependency is an import: `a.ts` imports `b.ts` → A depends on B, and a change in B may force a change in A.

## The principle

**Code that changes often depends on code that changes rarely — never the other way round.** Nothing should depend on code that changes often.

Example: A changes 10 times a month, B 5 times. No dependency → 15 files to touch. A depends on B → B's 5 changes also touch A → 20. B depends on A → A's 10 changes also touch B → 25. Over years and a team, the wrong direction costs person-years.

**Display changes more often than business logic.** A new loan type (business) always needs new UI, but the UI of the same loan is redrawn by every designer. So **display depends on business logic**:

```
main.tsx → View → Presenter → Tasks → Store
                      └──────────────→ Store (read)
           Tasks → api.* → callApi (transport)        everyone → lib/, ~shared/
```

- **Display:** View (`*.tsx`), Presenter (`logic/`).
- **Business logic:** Tasks (`tasks/`), Store (`src/entities/`).
- **The store is the most sensitive place:** everything depends on it. Keep it small and touch it from few places (see `sa-entities.md`).

## No cycles

If A imports B, B must not import A — not directly, and not through 5–6 other files. A cycle means every change in either file touches both. ESLint: `import-x/no-cycle` (type-only imports such as `import type { RootState }` are not counted).

## Who may import whom

| Layer | May import | Must not import | ESLint config |
|---|---|---|---|
| View `src/**/*.tsx` | own `./logic/usePresenter`, child components, `components/` above, Mantine, own `types.ts`, css | tasks, `~/entities/*`, `~/api/*`, `react-redux`, React hooks | `deps-view` |
| Presenter `src/**/logic/**` | tasks, store (`useSelector` + selectors), `lib/`, Mantine hooks, types | Views (`Folder/Folder`), `~/api/*` | `deps-presenter` |
| Task `src/**/tasks/**` | `~/api/api`, `~/entities/*`, `lib/`, other tasks, types | presenters and hooks (`use*`), Views, a component's `logic/`, React, Mantine, `callApi`, `fetch` | `deps-tasks` |
| Store `src/entities/**` | `@reduxjs/toolkit`, `~shared/*`, `lib/`, other entity files | `~/App/*`, tasks, `~/api/*`, React, Mantine | `deps-entities` |
| API `src/api/**` | `./callApi`, `~shared/*` | `~/App/*`, entities, tasks, React | `deps-api` |
| `src/lib/**`, `shared/**` | nothing app-specific | `~/App/*`, entities, `~/api/*`, tasks, React, Mantine | `deps-lib` |

Backend (`server/src/`): `index → app → routes → tasks → entities / tvmaze / lib`.

| Layer | Must not import | ESLint config |
|---|---|---|
| `tasks/` | `~/routes/*`, `express`, `cors`, `requestTvmaze` (use `tvmaze.*`) | `deps-server-tasks` |
| `entities/`, `tvmaze/` | `~/tasks/*`, `~/routes/*`, `express`, `cors` | `deps-server-entities` |
| `lib/` | `~/tasks/*`, `~/routes/*`, `~/entities/*` | `deps-server-lib` |

All configs: `eslint/simple-architecture-dependencies.js`.

## Contracts: dependency inversion

The arrows above are imports, but the layers are kept loose by **contracts** — an interface both sides agree on and both depend on (SOLID's Dependency Inversion: depend on abstractions, keep what one module knows about another to the interface).

- **Presenter ↔ Task.** The presenter says what it can pass and what it wants back; the task agrees and hides *how* (HTTP, cache, sockets, data mapping):

  ```ts
  const result = await loadHomePageVideos();      // contract: nothing in, TaskResult<Video[]> out
  if (result.ok) setVideos(result.data); else setError(result.error);
  ```

  Design it from the caller's side first: "what do I want from this task?" — `const { products, categories } = await loadProducts({ query })`. While the contract holds, either side changes alone: loading over sockets touches only the task; loading on click instead of on mount touches only the presenter.
- **View ↔ Presenter.** The View says what it needs to render — `value`, `options`, `onChange`, `disabled` — and the presenter delivers exactly that. The View is markup only; store changes stop at the presenter.
- **A library behind a module.** The app depends on a small interface of our own, and one module depends on the library: `api.products.search()` over `callApi`, `tvmaze.shows.get()` over `requestTvmaze`, result builders in `lib/taskResult`. Replacing the transport or the library touches that module only.

**Objects in contracts.** Pass and return objects where a contract may grow: `sessionStarted(user)`, `signIn({ user })`, `loadProducts({ query })`, `return success({ show, isFavorite })`. A new field then extends the contract without breaking any caller, and the call site names what it passes. A single primitive is fine when it will stay one (`removeFromCart(id)`).

Contracts also help reading, like links in Wikipedia: `await loadHomePageVideos()` is one line that says what happens; follow the "link" into the task only when *how* matters for your change.

## Identity goes down as a parameter

Who is logged in is global data (the store). Lower layers that need it — the API object, the transport — **get it as a parameter** from the task (`api.favorites.list(user, signal)`), never by importing the store upwards. The same for navigation: tasks report, presenters navigate (`sa-routing.md`).

## When you add code

1. Which side will change more often? That side imports the other.
2. A lower layer "needs" something from a higher one (a task needs a presenter's value, the store needs a task's result)? Pass it as a parameter or return it — don't import upwards.
3. Two modules import each other? Move the shared part down into a third module both can import (a type, a pure function in `lib/`).
4. Wrapping a library? Give the app a small interface and keep the library behind it.
