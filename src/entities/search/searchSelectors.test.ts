import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { favoritesReducer } from '~/entities/favorites/favoritesSlice';
import type { RootState } from '~/entities/store';
import {
  selectIsWaitingForServer,
  selectSearchError,
  selectSearchStatus,
  selectSelection,
} from './searchSelectors';
import { answerReceived, queryChanged, requestStarted, searchReducer } from './searchSlice';
import { makeShowsPage } from './testFixtures';

const makeStore = () =>
  configureStore({ reducer: { favorites: favoritesReducer, search: searchReducer } });
const request = { query: 'forest', genre: 'Drama', page: 2 };

describe('search selectors', () => {
  it('match an answer to its request by reference, also inside the store', () => {
    const store = makeStore();
    store.dispatch(queryChanged('forest'));
    store.dispatch(requestStarted(request));
    const state = () => store.getState() as RootState;
    expect(selectIsWaitingForServer(state())).toBe(true);

    const result = makeShowsPage({ genre: 'Drama', page: 2 });
    store.dispatch(answerReceived({ request, result, error: null }));
    expect(selectSearchStatus(state())).toBe('success');
    expect(selectIsWaitingForServer(state())).toBe(false);

    store.dispatch(requestStarted({ ...request })); // retry: equal values, new object
    expect(selectSearchStatus(state())).toBe('loading');
    expect(selectIsWaitingForServer(state())).toBe(true);
  });

  it('give the asked selection while loading and the applied one after', () => {
    const store = makeStore();
    store.dispatch(queryChanged('forest'));
    store.dispatch(requestStarted(request));
    expect(selectSelection(store.getState() as RootState)).toEqual({ genre: 'Drama', page: 2 });

    const result = makeShowsPage({ total: 1, genre: null, page: 1 });
    store.dispatch(answerReceived({ request, result, error: null }));
    expect(selectSelection(store.getState() as RootState)).toEqual({ genre: null, page: 1 });
  });

  it('report the error only for the current failed request', () => {
    const store = makeStore();
    store.dispatch(queryChanged('forest'));
    store.dispatch(requestStarted(request));
    store.dispatch(answerReceived({ request, result: null, error: 'TVmaze is down' }));
    expect(selectSearchError(store.getState() as RootState)).toBe('TVmaze is down');

    store.dispatch(requestStarted({ ...request }));
    expect(selectSearchError(store.getState() as RootState)).toBeNull();
  });
});
