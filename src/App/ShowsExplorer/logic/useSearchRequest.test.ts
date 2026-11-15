import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_DEBOUNCE_MS, useSearchRequest } from './useSearchRequest';

const advance = (ms = SEARCH_DEBOUNCE_MS) => act(() => vi.advanceTimersByTime(ms));
const render = (query = '', genre: string | null = null, page = 1) =>
  renderHook(() => useSearchRequest({ query, genre, page }));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSearchRequest', () => {
  it('starts from the URL state', () => {
    expect(render('dark', 'Drama', 2).result.current.request).toEqual({
      query: 'dark',
      genre: 'Drama',
      page: 2,
    });
    expect(render().result.current.request).toBeNull();
  });

  it('commits the query as a request on page 1 with all genres after the debounce', () => {
    const { result } = render('dark', 'Drama', 2);

    act(() => result.current.changeQuery(' fargo '));
    expect(result.current.request?.query).toBe('dark');
    advance();

    expect(result.current.request).toEqual({ query: 'fargo', genre: null, page: 1 });
  });

  it('keeps the same request (with its genre and page) when the query is typed back', () => {
    const { result } = render('dark', 'Drama', 2);
    const initial = result.current.request;

    act(() => result.current.changeQuery('dar'));
    act(() => result.current.changeQuery('dark'));
    advance();

    expect(result.current.request).toBe(initial);
  });

  it('drops the request at once when the field is emptied', () => {
    const { result } = render('dark');

    act(() => result.current.changeQuery(''));

    expect(result.current.request).toBeNull();
  });

  it('makes a new request at once for a genre (page 1) and for a page', () => {
    const { result } = render('dark', null, 3);

    act(() => result.current.selectGenre('Drama'));
    expect(result.current.request).toEqual({ query: 'dark', genre: 'Drama', page: 1 });

    act(() => result.current.selectPage(2));
    expect(result.current.request).toEqual({ query: 'dark', genre: 'Drama', page: 2 });
  });

  it('makes a new request with the same values on retry', () => {
    const { result } = render('dark', 'Drama', 2);
    const initial = result.current.request;

    act(() => result.current.retry());

    expect(result.current.request).not.toBe(initial);
    expect(result.current.request).toEqual(initial);
  });

  it('cancels the pending debounce on unmount', () => {
    const { result, unmount } = render();
    act(() => result.current.changeQuery('dark'));

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
