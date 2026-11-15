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
  store.ts                     # configureStore({ reducer: { favorites } }), RootState
  favorites/
    favoritesSlice.ts          # createSlice + actions + selectors of one entity
```

- One slice per entity, in its own folder. Selectors live next to the slice (`selectFavorites`, `selectIsFavorite(id)`).
- Entities don't import React or components.
- Keep **domain data** in the store, data that several distant components need (favorites: the star on each card and the counter in the header).
- **Not** in the store: loading/error flags of a request, form fields, UI toggles. They are local `useState` in the presenter. A task can be awaited, so nothing needs to go through Redux for that.
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
