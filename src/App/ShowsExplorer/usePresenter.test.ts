import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_ITEMS,
  PINE_ITEMS,
  flushDebounce,
  names,
  stubSearchApi,
} from './presenterTestUtils';
import { usePresenter } from './usePresenter';

async function renderOnDramaPage2() {
  const fetchMock = stubSearchApi({ forest: FOREST_ITEMS, pine: PINE_ITEMS });
  const { result } = renderHook(() => usePresenter());

  act(() => result.current.onQueryChange('forest'));
  await flushDebounce();
  act(() => result.current.onGenreChange('Drama'));
  act(() => result.current.onPageChange(2));

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
  it('keeps the genre, page and list when a query is edited and typed back', async () => {
    const { result, fetchMock } = await renderOnDramaPage2();
    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);

    act(() => result.current.onQueryChange('fores'));
    expect(result.current.showSkeleton).toBe(false);
    expect(result.current.selectedGenre).toBe('Drama');
    act(() => result.current.onQueryChange('forest '));
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);
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
