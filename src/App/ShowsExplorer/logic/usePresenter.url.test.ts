import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  stubShowsApi,
} from './presenterTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  stubShowsApi({ forest: FOREST_SHOWS });
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

    await flushRequests();

    expect(result.current.selectedGenre).toBe('Drama');
    expect(result.current.page).toBe(2);
    expect(names(result.current.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');
  });

  it('writes what the server applied: an unknown genre and a page out of range are dropped', async () => {
    window.history.replaceState(null, '', '/?q=forest&genre=Horror&page=9');
    const { result } = renderHook(() => usePresenter());

    await flushRequests();

    expect(result.current.selectedGenre).toBeNull();
    expect(result.current.page).toBe(3);
    expect(window.location.search).toBe('?q=forest&page=3');
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
    expect(window.location.search).toBe('?q=forest');
    await flushRequests();
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');

    act(() => result.current.onQueryClear());
    expect(window.location.search).toBe('');
  });
});
