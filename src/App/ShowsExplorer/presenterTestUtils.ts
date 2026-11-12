import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { makeSearchItem, okResponse } from './testFixtures';
import { SEARCH_DEBOUNCE_MS } from './useSearchQuery';

/** Five Drama shows (two pages with Drama selected) and two Comedy shows. */
export const FOREST_ITEMS = [1, 2, 3, 4, 5]
  .map((id) => makeSearchItem(id, `Forest ${id}`, ['Drama']))
  .concat([makeSearchItem(6, 'Forest 6', ['Comedy']), makeSearchItem(7, 'Forest 7', ['Comedy'])]);

export const PINE_ITEMS = [makeSearchItem(8, 'Pine', ['Comedy'])];

/** Answers each query from the given table; every answer is a fresh array. */
export function stubSearchApi(answers: Record<string, unknown[]>) {
  const fetchMock = vi.fn(async (url: string) => {
    const query = new URL(url).searchParams.get('q') ?? '';
    return okResponse(answers[query] ?? []);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export async function flushDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
  });
}

export const names = (shows: { name: string }[]) => shows.map((show) => show.name);
