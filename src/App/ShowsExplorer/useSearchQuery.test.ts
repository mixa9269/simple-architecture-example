import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_DEBOUNCE_MS, useSearchQuery } from './useSearchQuery';

const advance = (ms = SEARCH_DEBOUNCE_MS) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSearchQuery', () => {
  it('commits the query as a request after the debounce', () => {
    const { result } = renderHook(() => useSearchQuery(''));

    act(() => result.current.changeQuery(' dark '));
    expect(result.current.request).toBeNull();
    advance();

    expect(result.current.request).toEqual({ query: 'dark' });
  });

  it('keeps the same request when the query is typed back', () => {
    const { result } = renderHook(() => useSearchQuery('dark'));
    const initial = result.current.request;

    act(() => result.current.changeQuery('dar'));
    act(() => result.current.changeQuery('dark'));
    advance();

    expect(result.current.request).toBe(initial);
  });

  it('drops the request at once when the field is emptied', () => {
    const { result } = renderHook(() => useSearchQuery('dark'));

    act(() => result.current.changeQuery(''));

    expect(result.current.request).toBeNull();
  });

  it('makes a new request with the same query on retry', () => {
    const { result } = renderHook(() => useSearchQuery('dark'));
    const initial = result.current.request;

    act(() => result.current.retry());

    expect(result.current.request).not.toBe(initial);
    expect(result.current.request).toEqual({ query: 'dark' });
  });

  it('cancels the pending debounce on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useSearchQuery(''));
    act(() => result.current.changeQuery('dark'));

    unmount();

    expect(clearSpy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
