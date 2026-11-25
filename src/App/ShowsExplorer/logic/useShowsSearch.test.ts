import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EMPTY_URL,
  FOREST_SHOWS,
  PINE_SHOWS,
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
});

describe('useShowsSearch', () => {
  it('debounces typing into one request and is loading from the first keystroke', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = render();

    act(() => result.current.changeQuery('f'));
    act(() => result.current.changeQuery(' forest '));
    expect(result.current.status).toBe('loading');
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/shows?q=forest');
    expect(result.current.status).toBe('success');
    expect(names(result.current.page?.shows)).toEqual(['Forest 1', 'Forest 2', 'Forest 3']);
  });

  it('sends nothing when the query is typed back, keeping genre and page', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = render();
    act(() => result.current.changeQuery('forest'));
    await flushDebounce();
    act(() => result.current.selectGenre('Drama'));
    act(() => result.current.selectPage(2));
    await flushRequests();
    const calls = fetchMock.mock.calls.length;

    act(() => result.current.changeQuery('fores'));
    act(() => result.current.changeQuery('forest '));
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(calls);
    expect(result.current.params).toEqual({ query: 'forest', genre: 'Drama', page: 2 });
    expect(names(result.current.page?.shows)).toEqual(['Forest 4', 'Forest 5']);
    expect(result.current.status).toBe('success');
  });

  it('opens a new query on page 1 with all genres, keeping the old page while it loads', async () => {
    stubShowsApi({ forest: FOREST_SHOWS, pine: PINE_SHOWS });
    const { result } = render();
    act(() => result.current.changeQuery('forest'));
    await flushDebounce();
    act(() => result.current.selectGenre('Drama'));
    await flushRequests();

    act(() => result.current.changeQuery('pine'));
    expect(result.current.page?.query).toBe('forest');
    await flushDebounce();

    expect(result.current.params).toEqual({ query: 'pine', genre: null, page: 1 });
    expect(names(result.current.page?.shows)).toEqual(['Pine']);
  });

  it('drops everything at once when the field is emptied', async () => {
    const fetchMock = stubShowsApi({ forest: FOREST_SHOWS });
    const { result } = render();
    act(() => result.current.changeQuery('forest'));
    await flushDebounce();

    act(() => result.current.changeQuery(''));
    expect(result.current).toMatchObject({ status: 'idle', page: null, params: null });

    act(() => result.current.changeQuery('forest'));
    await flushDebounce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends nothing for a blank query and cancels a pending one', async () => {
    const fetchMock = stubShowsApi({});
    const { result } = render();

    act(() => result.current.changeQuery('dark'));
    act(() => result.current.changeQuery('   '));
    await flushDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });
});
