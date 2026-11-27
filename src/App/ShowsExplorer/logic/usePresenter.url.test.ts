import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FOREST_SHOWS, flushDebounce, flushRequests, names, stubShowsApi } from './searchTestUtils';
import { renderHookInRouter } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

const render = (url: string) => renderHookInRouter(() => usePresenter(), url);

beforeEach(() => {
  vi.useFakeTimers();
  stubShowsApi({ forest: FOREST_SHOWS });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ShowsExplorer usePresenter — URL state', () => {
  it('opens the search from the URL and keeps the URL while it loads', async () => {
    const { result } = render('/?q=forest&genre=Drama&page=2');
    expect(result.current.searchInput.value).toBe('forest');
    expect(result.current.location.search).toBe('?q=forest&genre=Drama&page=2');

    await flushRequests();

    expect(result.current.genreChips?.selectedGenre).toBe('Drama');
    expect(result.current.pagination?.value).toBe(2);
    expect(names(result.current.showsList.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(result.current.location.search).toBe('?q=forest&genre=Drama&page=2');
  });

  it('writes what the server applied: an unknown genre and a page out of range are dropped', async () => {
    const { result } = render('/?q=forest&genre=Horror&page=9');

    await flushRequests();

    expect(result.current.genreChips?.selectedGenre).toBeNull();
    expect(result.current.location.search).toBe('?q=forest&page=3');
  });

  it('writes the settled search and clears the URL with the field', async () => {
    const { result } = render('/');

    act(() => result.current.searchInput.onChange('forest'));
    expect(result.current.location.search).toBe('');
    await flushDebounce();
    expect(result.current.location.search).toBe('?q=forest');

    act(() => result.current.genreChips?.onChange('Drama'));
    act(() => result.current.pagination?.onChange(2));
    expect(result.current.location.search).toBe('?q=forest');
    await flushRequests();
    expect(result.current.location.search).toBe('?q=forest&genre=Drama&page=2');

    act(() => result.current.searchInput.onClear());
    expect(result.current.location.search).toBe('');
  });
});
