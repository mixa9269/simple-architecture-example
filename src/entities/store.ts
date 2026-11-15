import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';

/**
 * The app store (Entity layer). Presenters read it with useSelector;
 * tasks import it directly and call store.dispatch / store.getState (no thunks).
 */
export const store = configureStore({
  reducer: { favorites: favoritesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
