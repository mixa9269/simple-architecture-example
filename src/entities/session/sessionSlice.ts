import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '~shared/api';
import type { RootState } from '~/entities/store';

/** The logged-in user — the textbook global entity (header, favorites, stars on every card). */
interface SessionState {
  /** null for a guest. An object, so new fields (a name, an avatar) don't break the callers. */
  user: User | null;
}

const initialState: SessionState = { user: null };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    sessionEnded(state) {
      state.user = null;
    },
  },
});

export const { sessionStarted, sessionEnded } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;

export const selectUserEmail = (state: RootState) => state.session.user?.email ?? null;
export const selectIsLoggedIn = (state: RootState) => state.session.user !== null;
