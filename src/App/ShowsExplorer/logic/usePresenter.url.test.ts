import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  flushDebounce,
  flushRequests,
  names,
  resetSearch,
  run,
  searchState,
  stubShowsApi,
} from '~/App/ShowsExplorer/tasks/searchTestUtils';
import { selectGenre } from '~/App/ShowsExplorer/tasks/selectGenre';
import { selectPage } from '~/App/ShowsExplorer/tasks/selectPage';
import { typeQuery } from '~/App/ShowsExplorer/tasks/typeQuery';
import { selectSelection, selectShownResult } from '~/entities/search/searchSelectors';
import { store } from '~/entities/store';
import { renderHookWithStore } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

const shown = () => selectShownResult(store.getState());
const render = (url: string) => {
  window.history.replaceState(null, '', url);
  return renderHookWithStore(() => usePresenter());
};

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
  stubShowsApi({ forest: FOREST_SHOWS });
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('ShowsExplorer usePresenter — URL state', () => {
  it('restores the query, genre and page from the URL', async () => {
    render('/?q=forest&genre=Drama&page=2');
    expect(searchState().query).toBe('forest');
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2'); // kept while loading

    await flushRequests();

    expect(selectSelection(store.getState())).toEqual({ genre: 'Drama', page: 2 });
    expect(names(shown()?.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');
  });

  it('writes what the server applied: an unknown genre and a page out of range are dropped', async () => {
    render('/?q=forest&genre=Horror&page=9');

    await flushRequests();

    expect(selectSelection(store.getState())).toEqual({ genre: null, page: 3 });
    expect(window.location.search).toBe('?q=forest&page=3');
  });

  it('writes the settled search state to the URL', async () => {
    render('/');
    await flushRequests();

    run(() => typeQuery('forest'));
    expect(window.location.search).toBe('');
    await flushDebounce();
    expect(window.location.search).toBe('?q=forest');

    run(() => selectGenre('Drama'));
    run(() => selectPage(2));
    expect(window.location.search).toBe('?q=forest');
    await flushRequests();
    expect(window.location.search).toBe('?q=forest&genre=Drama&page=2');

    run(() => typeQuery(''));
    expect(window.location.search).toBe('');
  });
});
