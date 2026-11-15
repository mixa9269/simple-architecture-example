---
description: Simple Architecture — Entities are the Redux Toolkit store; presenters read it with useSelector, tasks import the store and dispatch directly
paths:
  - "src/entities/**"
  - "src/**/logic/**"
---

# Entities: the store

In VIPER the **Entity** is data plus the methods that update it. In our app that is the state manager: **Redux Toolkit**.

```
src/entities/
  store.ts                     # configureStore({ reducer: { favorites, search } }), RootState
  favorites/
    favoritesSlice.ts          # createSlice + actions + selectors of one entity
  search/
    searchSlice.ts             # set-only reducers: queryChanged, requestStarted, answerReceived, searchCleared
    searchSelectors.ts         # selectors (createSelector for new objects), in their own file once they grow
    getSearchStatus.ts, …      # pure functions the selectors wrap, with tests
    types.ts                   # SearchRequest, SearchAnswer, SearchStatus
```

- One slice per entity, in its own folder. Selectors live next to the slice (`selectFavorites`, `selectIsFavorite(id)`); when they grow, they move to `<entity>Selectors.ts` in the same folder.
- **Reducers are set-only** ("the store is a database"): `queryChanged`, `requestStarted`, `answerReceived`. Rules about *what* to store live in tasks.
- **Derived values are selectors** (`selectSearchStatus`, `selectShownResult`, `selectSelection`), wrapping pure functions kept in the entity folder. Use `createSelector` when a selector returns a new object or array.
- Entities don't import React or components.
- Keep in the store what **several components** need: domain data (favorites: the star on each card and the counter in the header) and shared UI state (the search: the field text, the committed request and its answer are read by the field, the chips, the status, the list and the pagination).
- **Not** in the store: state of one component (a drawer's `opened`, a star's `isPending`, a "slow request" timer) and loading flags you can derive (`status` is computed from `request` and `answer`). A task can be awaited, so nothing needs to go through Redux for that.
- If the server owns the data (favorites), the store is only its **mirror**: the server decides, its answer replaces the slice (`favoritesReceived(list)`).

## Who uses the store how

| Layer | How |
|---|---|
| Presenter (`logic/usePresenter.ts`, hooks) | `useSelector(selectX)` to read |
| Task (`logic/tasks/*`, `src/tasks/*`) | `import { store } from '~/entities/store'` → `store.dispatch(action)`, `store.getState()`, e.g. right after `await api.favorites.toggle(id)` |
| View | never: it gets everything from its presenter |
| `src/main.tsx` | `<Provider store={store}>` |

Using the store object directly from a task is an official API of Redux (and of MobX, Zustand). No redux-thunk / saga needed.

## Tests

Use the real store: wrap `renderHook` in a `Provider` (`~/testUtils/storeTestUtils.ts`) and reset the slice in `beforeEach` (`setFavorites([])`).
