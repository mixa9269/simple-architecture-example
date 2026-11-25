import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';

/**
 * The app store (Entity layer): global data only — the favorites.
 * Presenters read it with useSelector; tasks import it and call store.dispatch (no thunks).
 */
export const store = configureStore({
  reducer: { favorites: favoritesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
