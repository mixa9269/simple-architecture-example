import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FOREST_SHOWS,
  flushDebounce,
  flushRequests,
  resetSearch,
  run,
  stubShowsApi,
} from '~/App/ShowsExplorer/tasks/searchTestUtils';
import { typeQuery } from '~/App/ShowsExplorer/tasks/typeQuery';
import { renderHookWithStore } from '~/testUtils/storeTestUtils';
import { usePresenter } from './usePresenter';

beforeEach(() => {
  vi.useFakeTimers();
  resetSearch();
});

afterEach(() => {
  resetSearch();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('GenreChips usePresenter', () => {
  it('is hidden until there are results with genres', async () => {
    stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = renderHookWithStore(() => usePresenter());
    expect(result.current.isHidden).toBe(true);

    run(() => typeQuery('forest'));
    await flushDebounce();

    expect(result.current.isHidden).toBe(false);
    expect(result.current.items.map((item) => item.label)).toEqual(['All', 'Comedy', 'Drama']);
    expect(result.current.value).toBe('__all__');
  });

  it('selects a genre at once and back to all genres', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = renderHookWithStore(() => usePresenter());
    run(() => typeQuery('forest'));
    await flushDebounce();

    act(() => void result.current.onChange('Drama'));
    expect(result.current.value).toBe('Drama');
    await flushRequests();
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe('/api/shows?q=forest&genre=Drama');

    act(() => void result.current.onChange('__all__'));
    await flushRequests();
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe('/api/shows?q=forest');
    expect(result.current.value).toBe('__all__');
  });
});
