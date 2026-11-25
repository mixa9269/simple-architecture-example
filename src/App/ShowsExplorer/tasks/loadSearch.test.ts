import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectSearchStatus, selectShownResult } from '~/entities/search/searchSelectors';
import { makeShow, makeShowsPage, okResponse } from '~/entities/search/testFixtures';
import { store } from '~/entities/store';
import {
  FOREST_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  resetSearch,
  run,
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

describe('search tasks: genre, page, retry, cancellation', () => {
  it('loads a genre on page 1 and another page at once, keeping the shown page meanwhile', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    run(() => typeQuery('forest'));
    await flushDebounce();

    run(() => selectGenre('Drama'));
    expect(status()).toBe('loading');
    expect(names(shown()?.shows)).toEqual(['Forest 1', 'Forest 2', 'Forest 3']);
    run(() => selectPage(2));
    await flushRequests();

    expect(fetchMock).toHaveBeenLastCalledWith('/api/shows?q=forest&genre=Drama&page=2', {
      signal: expect.any(AbortSignal),
    });
    expect(names(shown()?.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(shown()).toMatchObject({ genre: 'Drama', page: 2, total: 7, filteredTotal: 5 });
  });

  it('aborts the previous load and never stores its late answer', async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        signals.push(init.signal as AbortSignal);
        const query = new URL(url, 'http://localhost').searchParams.get('q') ?? '';
        // The server ignores the abort and answers "pine" late; "oak" never answers.
        if (query === 'pine') await new Promise((resolve) => setTimeout(resolve, 1000));
        if (query === 'oak') await new Promise(() => {});
        return okResponse(makeShowsPage({ query, shows: [makeShow({ name: query })] }));
      }),
    );

    run(() => typeQuery('forest'));
    await flushDebounce();
    run(() => typeQuery('pine'));
    await flushDebounce();
    run(() => typeQuery('oak'));
    await flushDebounce();
    await vi.advanceTimersByTimeAsync(1000);

    expect(signals[1].aborted).toBe(true);
    expect(status()).toBe('loading');
    expect(names(shown()?.shows)).toEqual(['forest']);
  });
});
