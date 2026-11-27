import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '~/entities/store';

/** The logged-in user — the textbook global entity (header, favorites, stars on every card). */
interface SessionState {
  /** The email is the identity; null for a guest. */
  email: string | null;
}

const initialState: SessionState = { email: null };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    sessionEnded(state) {
      state.email = null;
    },
  },
});

export const { sessionStarted, sessionEnded } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;

export const selectUserEmail = (state: RootState) => state.session.email;
export const selectIsLoggedIn = (state: RootState) => state.session.email !== null;
