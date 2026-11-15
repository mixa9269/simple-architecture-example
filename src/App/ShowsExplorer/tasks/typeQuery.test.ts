import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectSearchStatus, selectShownResult } from '~/entities/search/searchSelectors';
import { store } from '~/entities/store';
import {
  FOREST_SHOWS,
  PINE_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  resetSearch,
  run,
  searchState,
  stubShowsApi,
} from './searchTestUtils';
import { selectGenre } from './selectGenre';
import { selectPage } from './selectPage';
import { typeQuery } from './typeQuery';

const status = () => selectSearchStatus(store.getState());
const shown = () => selectShownResult(store.getState());

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('typeQuery', () => {
  it('stores the text at once and searches once typing stops', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });

    run(() => typeQuery('f'));
    run(() => typeQuery('fore'));
    run(() => typeQuery(' forest '));
    expect(searchState().query).toBe(' forest ');
    expect(status()).toBe('loading');
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/shows?q=forest');
    expect(status()).toBe('success');
    expect(names(shown()?.shows)).toEqual(['Forest 1', 'Forest 2', 'Forest 3']);
  });

  it('keeps the request, genre, page and list when the query is typed back', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    run(() => typeQuery('forest'));
    await flushDebounce();
    run(() => selectGenre('Drama'));
    run(() => selectPage(2));
    await flushRequests();
    const calls = fetchMock.mock.calls.length;

    run(() => typeQuery('fores'));
    expect(names(shown()?.shows)).toEqual(['Forest 4', 'Forest 5']);
    run(() => typeQuery('forest '));
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(calls);
    expect(searchState().request).toEqual({ query: 'forest', genre: 'Drama', page: 2 });
    expect(status()).toBe('success');
  });

  it('opens a new query on page 1 with all genres and keeps the old list while it loads', async () => {
    stubShowsApi({ forest: FOREST_SHOWS, pine: PINE_SHOWS });
    run(() => typeQuery('forest'));
    await flushDebounce();
    run(() => selectGenre('Drama'));
    await flushRequests();

    run(() => typeQuery('pine'));
    expect(status()).toBe('loading');
    expect(shown()?.query).toBe('forest');
    await flushDebounce();

    expect(searchState().request).toEqual({ query: 'pine', genre: null, page: 1 });
    expect(names(shown()?.shows)).toEqual(['Pine']);
  });

  it('drops the search at once when the field is emptied', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    run(() => typeQuery('forest'));
    await flushDebounce();

    run(() => typeQuery(''));
    expect(status()).toBe('idle');
    expect(shown()).toBeNull();

    run(() => typeQuery('forest'));
    expect(shown()).toBeNull(); // skeletons, not the dropped list
    await flushDebounce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends nothing for a blank query and cancels a pending search', async () => {
    const fetchMock = stubShowsApi({});

    run(() => typeQuery('dark'));
    run(() => typeQuery('   '));
    await flushDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(status()).toBe('idle');
  });
});
