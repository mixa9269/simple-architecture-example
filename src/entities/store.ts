import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';
import { sessionReducer } from './session/sessionSlice';

/**
 * The app store (Entity layer): global data only — the logged-in user and their favorites.
 * Presenters read it with useSelector; tasks import it and call store.dispatch (no thunks).
 */
export const store = configureStore({
  reducer: { session: sessionReducer, favorites: favoritesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
