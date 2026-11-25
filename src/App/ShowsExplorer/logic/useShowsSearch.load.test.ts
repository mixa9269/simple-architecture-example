import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, makeShow, okResponse } from '~/testUtils/fixtures';
import {
  EMPTY_URL,
  FOREST_SHOWS,
  fakeShowsPage,
  flushDebounce,
  flushRequests,
  names,
  stubShowsApi,
} from './searchTestUtils';
import { useShowsSearch } from './useShowsSearch';

const render = (initial = EMPTY_URL) => renderHook(() => useShowsSearch(initial));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useShowsSearch — loading', () => {
  it('loads the search it was opened with', async () => {
    stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = render({ query: 'forest', genre: 'Drama', page: 2 });
    expect(result.current.status).toBe('loading');

    await flushRequests();

    expect(names(result.current.page?.shows)).toEqual(['Forest 4', 'Forest 5']);
  });

  it('switches genre (page 1) and page at once, keeping the shown page meanwhile', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = render({ query: 'forest', genre: null, page: 1 });
    await flushRequests();

    act(() => result.current.selectGenre('Drama'));
    expect(result.current).toMatchObject({ isFetching: true, status: 'loading' });
    expect(result.current.page?.genre).toBeNull();
    act(() => result.current.selectPage(2));
    await flushRequests();

    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe('/api/shows?q=forest&genre=Drama&page=2');
    expect(result.current.page).toMatchObject({ genre: 'Drama', page: 2, filteredTotal: 5 });
  });

  it('aborts the previous load and never shows its late answer', async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        signals.push(init.signal as AbortSignal);
        const query = new URL(url, 'http://localhost').searchParams.get('q') ?? '';
        // The server ignores the abort and answers "pine" late; "oak" never answers.
        if (query === 'pine') await new Promise((resolve) => setTimeout(resolve, 1000));
        if (query === 'oak') await new Promise(() => {});
        return okResponse(fakeShowsPage(query, [makeShow({ name: query })]));
      }),
    );
    const { result } = render();

    for (const query of ['forest', 'pine', 'oak']) {
      act(() => result.current.changeQuery(query));
      await flushDebounce();
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(signals[1].aborted).toBe(true);
    expect(result.current.status).toBe('loading');
    expect(names(result.current.page?.shows)).toEqual(['forest']);
  });

  it('logs and reports an error, then recovers on retry', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const page = fakeShowsPage('fargo', [makeShow({ name: 'Fargo' })]);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(errorResponse(502, { error: 'TVmaze is down' }))
        .mockResolvedValueOnce(okResponse(page)),
    );
    const { result } = render();
    act(() => result.current.changeQuery('fargo'));
    await flushDebounce();

    expect(result.current).toMatchObject({ status: 'error', error: 'TVmaze is down', page: null });
    expect(consoleError).toHaveBeenCalled();

    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    await flushRequests();
    expect(names(result.current.page?.shows)).toEqual(['Fargo']);
  });

  it('does nothing for genre, page or retry before the first search', () => {
    const fetchMock = stubShowsApi({});
    const { result } = render();

    act(() => result.current.selectGenre('Drama'));
    act(() => result.current.selectPage(2));
    act(() => result.current.retry());

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
