import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';
import { searchReducer } from './search/searchSlice';

/**
 * The app store (Entity layer). Presenters read it with useSelector;
 * tasks import it directly and call store.dispatch / store.getState (no thunks).
 */
export const store = configureStore({
  reducer: { favorites: favoritesReducer, search: searchReducer },
});

export type RootState = ReturnType<typeof store.getState>;
