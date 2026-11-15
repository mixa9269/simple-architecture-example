import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  PINE_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  stubShowsApi,
} from './presenterTestUtils';
import { usePresenter } from './usePresenter';

async function renderOnDramaPage2() {
  const fetchMock = stubShowsApi({ forest: FOREST_SHOWS, pine: PINE_SHOWS });
  const { result } = renderHook(() => usePresenter());

  act(() => result.current.onQueryChange('forest'));
  await flushDebounce();
  act(() => result.current.onGenreChange('Drama'));
  act(() => result.current.onPageChange(2));
  await flushRequests();

  return { result, fetchMock };
}

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ShowsExplorer usePresenter', () => {
  it('shows the page of the selected genre that the server returned', async () => {
    const { result, fetchMock } = await renderOnDramaPage2();

    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(result.current.genres).toEqual(['Comedy', 'Drama']);
    expect(result.current).toMatchObject({ totalCount: 7, filteredCount: 5, totalPages: 2 });
    expect(fetchMock).toHaveBeenLastCalledWith('/api/shows?q=forest&genre=Drama&page=2', {
      signal: expect.any(AbortSignal),
    });
  });

  it('keeps the shown page while the next page loads; the control responds at once', async () => {
    const { result } = await renderOnDramaPage2();

    act(() => result.current.onPageChange(1));
    expect(result.current.page).toBe(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.showSkeleton).toBe(false);
    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);

    await flushRequests();
    expect(names(result.current.shows)).toEqual(['Forest 1', 'Forest 2', 'Forest 3']);
  });

  it('keeps the genre, page and list when a query is edited and typed back', async () => {
    const { result, fetchMock } = await renderOnDramaPage2();
    const calls = fetchMock.mock.calls.length;

    act(() => result.current.onQueryChange('fores'));
    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.selectedGenre).toBe('Drama');
    act(() => result.current.onQueryChange('forest '));
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(calls);
    expect(result.current.selectedGenre).toBe('Drama');
    expect(result.current.page).toBe(2);
    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);
  });

  it('keeps the shown results while the next query loads, then opens it on page 1', async () => {
    const { result } = await renderOnDramaPage2();

    act(() => result.current.onQueryChange('pine'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.resultsQuery).toBe('forest');
    expect(result.current.totalCount).toBe(7);

    await flushDebounce();

    expect(result.current.resultsQuery).toBe('pine');
    expect(result.current.selectedGenre).toBeNull();
    expect(result.current.page).toBe(1);
    expect(names(result.current.shows)).toEqual(['Pine']);
  });

  it('shows skeletons for the next query after the field was cleared', async () => {
    const { result } = await renderOnDramaPage2();

    act(() => result.current.onQueryClear());
    expect(result.current.status).toBe('idle');
    expect(result.current.shows).toEqual([]);

    act(() => result.current.onQueryChange('forest'));
    expect(result.current.showSkeleton).toBe(true);
    await flushDebounce();

    expect(result.current.selectedGenre).toBeNull();
    expect(result.current.page).toBe(1);
  });
});
