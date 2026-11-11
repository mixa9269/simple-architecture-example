import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FOREST_ITEMS, flushDebounce, names, stubSearchApi } from './presenterTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  stubSearchApi({ forest: FOREST_ITEMS });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('ShowsExplorer usePresenter — URL state', () => {
  it('restores the query, genre and page from the URL', async () => {
    window.history.replaceState(null, '', '/?q=forest&genre=Drama&page=2');
    const { result } = renderHook(() => usePresenter());
    expect(result.current.query).toBe('forest');

    await flushDebounce();

    expect(result.current.selectedGenre).toBe('Drama');
    expect(result.current.page).toBe(2);
    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');
  });

  it('writes the settled search state to the URL', async () => {
    window.history.replaceState(null, '', '/');
    const { result } = renderHook(() => usePresenter());

    act(() => result.current.onQueryChange('forest'));
    expect(window.location.search).toBe('');
    await flushDebounce();
    expect(window.location.search).toBe('?q=forest');

    act(() => result.current.onGenreChange('Drama'));
    act(() => result.current.onPageChange(2));
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');

    act(() => result.current.onQueryClear());
    expect(window.location.search).toBe('');
  });
});
