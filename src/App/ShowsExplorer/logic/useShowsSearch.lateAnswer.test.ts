import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushDebounce, names } from './presenterTestUtils';
import { makeShow, makeShowsPage, okResponse } from './testFixtures';
import { useShowsSearch } from './useShowsSearch';

const SLOW_MS = 1000;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('never shows a late answer to a cancelled request', async () => {
  // A server that ignores the abort signal and answers "pine" late.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const query = new URL(url, 'http://localhost').searchParams.get('q');
      if (query === 'pine') await new Promise((resolve) => setTimeout(resolve, SLOW_MS));
      if (query === 'oak') await new Promise(() => {});
      return okResponse(makeShowsPage({ shows: [makeShow({ name: query ?? '' })] }));
    }),
  );
  const { result } = renderHook(() => useShowsSearch({ query: '', genre: null, page: 1 }));

  act(() => result.current.changeQuery('forest'));
  await flushDebounce();
  act(() => result.current.changeQuery('pine'));
  await flushDebounce();
  act(() => result.current.changeQuery('oak'));
  await flushDebounce();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SLOW_MS);
  });

  expect(result.current.status).toBe('loading');
  expect(names(result.current.shownAnswer?.result?.shows ?? [])).toEqual(['forest']);
});
