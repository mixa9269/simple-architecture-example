---
description: Simple Architecture — Entities are the Redux Toolkit store for global data only (get/set, no logic); minimize what is stored and who reads it; a screen's data, loading and errors live in its presenter
paths:
  - "src/entities/**"
  - "src/**/logic/**"
  - "src/**/tasks/**"
---

# Entities: the store

In VIPER the **Entity** is data plus the methods that update it. In our app that is the state manager: **Redux Toolkit**.

The whole app depends on the store (see `sa-dependencies.md`), so it is the **most sensitive place**: a change in it can break any layer. Two rules follow:

1. **Minimize what is stored.**
2. **Minimize who reads and writes it.**

## Only global data

The store is for information the **whole app** needs — the lecture's example is the current user (avatar in the header, name in the order, …). Ours are exactly that: the **session** (the logged-in email: header, stars, favorites requests) and the user's **favorites** (the star on every card and the counter in the header) — read in unrelated parts of the UI.

Test: *would two independent screens or features read it?* If not, it does not go to the store.

**Not in the store** — even when several components of one screen use it:

- loading flags and errors of a request;
- the data of one screen or one subtree (search results, a form, a list's page and filter);
- UI state (a drawer's `opened`, a star's `isPending`, a timer) — unless distant components share it (see below).

The task **returns** that data; the presenter of the component that owns it keeps it in `useState` and passes it down as props (see `sa-presenter-layer.md`, `sa-tasks-layer.md`):

```ts
// presenter: the store is not involved at all
const [videos, setVideos] = useState<Video[]>([]);
const [error, setError] = useState<string | null>(null);
// …
const result = await loadHomePageVideos();
if (result.ok) setVideos(result.data); else setError(result.error);
```

No action, reducer, selector or type to add, nothing global to break. Keep the store small enough that anyone sees at a glance what is global — about a dozen entities for a whole app.

## Small stores for shared UI state

UI state is local by default. When **distant** components need the same UI state — a button in the header opens a drawer rendered elsewhere — passing it through many levels of props couples every component on the way. Then a **small store of one concern** is the simpler option: a tiny slice (`entities/favoritesDrawer/`: `isOpen`, `drawerOpened(bool)`) or a feature store. Only the components that need it read it, and their presenters write it directly (`sa-presenter-layer.md`, "Writing the store directly"). Keep it tiny: one concern, set-only, no data that belongs to one screen.

## Shape

```
src/entities/
  store.ts                     # configureStore({ reducer: { cart, user, … } }), RootState
  cart/
    cartSlice.ts               # createSlice: set-only reducers + selectors of one entity
```

- One slice per entity, in its own folder. Selectors live next to the slice (`selectCartItems`, `selectIsInCart(id)`); when they grow, they move to `<entity>Selectors.ts` in the same folder.
- **Only get/set** ("the store is a database"): set-only reducers (`cartReceived(items)`) and selectors. **No logic and no requests** in the store — no async `fetch` methods (as Zustand's docs suggest); loading is a task's job.
- Actions and selectors exist to **reduce coupling** to the store's shape: callers depend on `selectIsInCart(id)`, not on `state.cart.items`.
- Derived values are selectors, wrapping pure functions kept in the entity folder; `createSelector` when the result is a new object or array.
- Entities import nothing above them: no React, no components, no tasks, no API (ESLint `deps-entities`).
- If the server owns the data (favorites), the store is only its **mirror**: the server decides, its answer replaces the slice.
- **Optimistic updates** (the UI reacts before the server answers): the task writes the expected value first, the server's answer replaces it, and on an error the task rolls back **only its own change** (re-apply the inverse to the current state, not a snapshot — other changes may have happened meanwhile). See `sa-tasks-layer.md`.

## The session

The logged-in user is the textbook global entity (`entities/session/`: `user: User | null`, `sessionStarted(user)`, `sessionEnded`, `selectUserEmail`, `selectIsLoggedIn`). The payload is an object, so a new field (a name, an avatar) doesn't break the callers.

- **Surviving a reload**: the email is saved through `lib/storage` (a localStorage wrapper) by the login task, and a global task `restoreSession()` is called once from `main.tsx` **before the first render** — so the UI never flashes "Log in" for a logged-in user.
- **Logout** is a task too (`src/tasks/logOut.ts`): forget the saved email, `sessionEnded()`, and clear the user's data in the store (`favoritesReceived([])`). Data that belongs to the user lives on the server and comes back with the next login.
- The store never decides *who* may do what — that is the server's rule; the client only mirrors who is logged in.

## Who uses the store how

| Layer | How |
|---|---|
| Presenter (`logic/usePresenter.ts`, hooks) | `useSelector(selectX)` — only presenters that really need global data |
| Task (`logic/tasks/*`, `tasks/*`) | `import { store } from '~/entities/store'` → `store.dispatch(action)`, `store.getState()` — only for global data, e.g. after `await api.cart.add(id)` |
| View | never: it gets everything from its presenter (ESLint `deps-view`) |
| `src/main.tsx` | `<Provider store={store}>` |

Using the store object directly from a task is an official API of Redux (and of MobX, Zustand). No redux-thunk / saga needed.

## Tests

Use the real store: wrap `renderHook` in a `Provider` (`~/testUtils/storeTestUtils.ts`) and reset the slice in `beforeEach` (e.g. a `setCart([])` helper). Presenters that keep their data locally need no store in tests at all.
