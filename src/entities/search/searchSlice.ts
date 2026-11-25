import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SearchAnswer, SearchRequest } from './types';

/**
 * The search, shared by the field, the chips, the status, the list and the pagination.
 * Set-only: the rules (debounce, what to load, cancellation) live in the search tasks.
 */
interface SearchState {
  /** The text in the field, as typed. */
  query: string;
  /** The committed request: being loaded or loaded. */
  request: SearchRequest | null;
  /** The answer to some request; it is current when `answer.request === request`. */
  answer: SearchAnswer | null;
}

const initialState: SearchState = { query: '', request: null, answer: null };

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    requestStarted(state, action: PayloadAction<SearchRequest>) {
      state.request = action.payload;
    },
    answerReceived(state, action: PayloadAction<SearchAnswer>) {
      state.answer = action.payload;
    },
    searchCleared(state) {
      state.request = null;
      state.answer = null;
    },
  },
});

export const { queryChanged, requestStarted, answerReceived, searchCleared } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
