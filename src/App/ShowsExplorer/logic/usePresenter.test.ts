import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  PINE_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  stubShowsApi,
} from './searchTestUtils';
import { renderHookInRouter } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  stubShowsApi({ forest: FOREST_SHOWS, pine: PINE_SHOWS });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ShowsExplorer usePresenter — props for the children', () => {
  it('hides chips and pagination until there are results; skeletons only without results', async () => {
    const { result } = renderHookInRouter(() => usePresenter());
    expect(result.current).toMatchObject({ genreChips: null, pagination: null });

    act(() => result.current.searchInput.onChange('forest'));
    expect(result.current.showsList.showSkeleton).toBe(true);
    await flushDebounce();

    expect(result.current.showsList.showSkeleton).toBe(false);
    expect(result.current.genreChips?.genres).toEqual(['Comedy', 'Drama']);
    expect(result.current.pagination).toMatchObject({ value: 1, total: 3 });
    expect(result.current.resultsStatus).toMatchObject({ status: 'success', totalCount: 7 });
  });

  it('moves the chip and the page at once and keeps the list while the server answers', async () => {
    const { result } = renderHookInRouter(() => usePresenter());
    act(() => result.current.searchInput.onChange('forest'));
    await flushDebounce();

    act(() => result.current.genreChips?.onChange('Drama'));
    expect(result.current.genreChips?.selectedGenre).toBe('Drama');
    expect(result.current.resultsStatus.waitingFor).toEqual({ query: 'forest', genre: 'Drama', page: 1 });
    expect(names(result.current.showsList.shows)).toEqual(['Forest 1', 'Forest 2', 'Forest 3']);
    await flushRequests();

    act(() => result.current.pagination?.onChange(2));
    expect(result.current.pagination?.value).toBe(2);
    await flushRequests();
    expect(names(result.current.showsList.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(result.current.resultsStatus.waitingFor).toBeNull();
  });

  it('shows the hidden pagination for a single page and clears everything on clear', async () => {
    const { result } = renderHookInRouter(() => usePresenter());
    act(() => result.current.searchInput.onChange('pine'));
    await flushDebounce();
    expect(result.current.pagination).toBeNull();

    act(() => result.current.searchInput.onClear());
    expect(result.current.resultsStatus.status).toBe('idle');
    expect(result.current.showsList.shows).toEqual([]);
  });
});
