import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Show } from '~shared/api';
import type { RootState } from '~/entities/store';

/** Mirror of the favorites kept on the server (the server decides, the store only remembers). */
interface FavoritesState {
  shows: Show[];
}

const initialState: FavoritesState = { shows: [] };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    favoritesReceived(state, action: PayloadAction<Show[]>) {
      state.shows = action.payload;
    },
  },
});

export const { favoritesReceived } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;

export const selectFavorites = (state: RootState) => state.favorites.shows;
export const selectFavoritesCount = (state: RootState) => state.favorites.shows.length;
export const selectIsFavorite = (id: number) => (state: RootState) =>
  state.favorites.shows.some((show) => show.id === id);
