import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '~/entities/store';
import { getSearchStatus } from './getSearchStatus';
import { getSelection } from './getSelection';
import { getShownAnswer } from './getShownAnswer';

export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchRequest = (state: RootState) => state.search.request;

export const selectSearchStatus = (state: RootState) =>
  getSearchStatus(state.search.query.trim(), state.search.request, state.search.answer);

/** The answer to keep on screen (also while the next query, genre or page loads). */
export const selectShownAnswer = (state: RootState) =>
  getShownAnswer(selectSearchStatus(state), state.search.answer);

/** The page on screen, or null. */
export const selectShownResult = (state: RootState) => selectShownAnswer(state)?.result ?? null;

/** Genre and page for the chips and the pagination. */
export const selectSelection = createSelector(
  [selectSearchStatus, selectSearchRequest, selectShownResult],
  getSelection,
);

export const selectSearchError = (state: RootState) =>
  selectSearchStatus(state) === 'error' ? (state.search.answer?.error ?? null) : null;

/** A request is committed and its answer has not arrived yet (debounce does not count). */
export const selectIsWaitingForServer = (state: RootState) =>
  state.search.request !== null && state.search.answer?.request !== state.search.request;
