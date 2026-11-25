import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  selectSearchError,
  selectSearchStatus,
  selectShownResult,
} from '~/entities/search/searchSelectors';
import { errorResponse, makeShow, makeShowsPage, okResponse } from '~/entities/search/testFixtures';
import { store } from '~/entities/store';
import { retrySearch } from './retrySearch';
import {
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
  vi.restoreAllMocks();
});

describe('retrySearch', () => {
  it('logs and reports an error, then recovers on retry with a new request object', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const page = makeShowsPage({ query: 'fargo', shows: [makeShow({ name: 'Fargo' })] });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(errorResponse(502, { error: 'TVmaze is down' }))
        .mockResolvedValueOnce(okResponse(page)),
    );
    run(() => typeQuery('fargo'));
    await flushDebounce();

    expect(status()).toBe('error');
    expect(selectSearchError(store.getState())).toBe('TVmaze is down');
    expect(consoleError).toHaveBeenCalled();

    const failed = searchState().request;
    run(() => retrySearch());
    expect(searchState().request).not.toBe(failed);
    expect(status()).toBe('loading');
    await flushRequests();
    expect(names(shown()?.shows)).toEqual(['Fargo']);
  });

  it('does nothing for genre, page or retry before the first search', async () => {
    const fetchMock = stubShowsApi({});

    await selectGenre('Drama');
    await selectPage(2);
    await retrySearch();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
