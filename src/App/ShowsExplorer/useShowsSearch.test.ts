import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorResponse, makeSearchItem, okResponse } from './testFixtures';
import { SEARCH_DEBOUNCE_MS, useShowsSearch } from './useShowsSearch';

async function flushDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
  });
}

const renderSearch = () => renderHook(() => useShowsSearch(''));
const shownNames = (shown: { shows: { name: string }[] } | null) =>
  shown?.shows.map((show) => show.name);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useShowsSearch', () => {
  it('debounces fast typing into a single request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse([makeSearchItem(1, 'Murder')]));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderSearch();

    act(() => result.current.setQuery('m'));
    act(() => result.current.setQuery('mur'));
    act(() => result.current.setQuery('murder'));
    expect(result.current.status).toBe('loading');

    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('q=murder');
    expect(result.current.status).toBe('success');
    expect(shownNames(result.current.shownResult)).toEqual(['Murder']);
  });

  it('aborts the previous request when the query changes', async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        signals.push(init.signal as AbortSignal);
        return new Promise<Response>(() => {});
      }),
    );
    const { result } = renderSearch();

    act(() => result.current.setQuery('kill'));
    await flushDebounce();
    act(() => result.current.setQuery('kill bill'));
    await flushDebounce();

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('does not request anything for a blank query', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderSearch();

    act(() => result.current.setQuery('   '));
    await flushDebounce();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    expect(result.current.shownResult).toBeNull();
  });

  it('reports an error and recovers on retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(okResponse([makeSearchItem(2, 'Fargo')]));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderSearch();

    act(() => result.current.setQuery('fargo'));
    await flushDebounce();
    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('500');

    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('sends the query again when it is typed back after the field was emptied', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse([makeSearchItem(3, 'Dark')]));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderSearch();

    act(() => result.current.setQuery('dark'));
    await flushDebounce();
    act(() => result.current.setQuery(''));
    expect(result.current.shownResult).toBeNull();

    act(() => result.current.setQuery('dark'));
    expect(result.current.shownResult).toBeNull(); // skeletons, not the dropped answer
    await flushDebounce();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(shownNames(result.current.shownResult)).toEqual(['Dark']);
  });
});
