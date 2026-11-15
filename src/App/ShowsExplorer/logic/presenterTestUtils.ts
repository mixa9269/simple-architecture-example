import { act } from '@testing-library/react';
import { vi } from 'vitest';
import type { Show, ShowsPage } from '~/App/ShowsExplorer/types';
import { makeShow, okResponse } from './testFixtures';
import { SEARCH_DEBOUNCE_MS } from './useSearchRequest';

/** Five Drama shows (two pages with Drama selected) and two Comedy shows. */
export const FOREST_SHOWS = [1, 2, 3, 4, 5]
  .map((id) => makeShow({ id, name: `Forest ${id}`, genres: ['Drama'] }))
  .concat([6, 7].map((id) => makeShow({ id, name: `Forest ${id}`, genres: ['Comedy'] })));

export const PINE_SHOWS = [makeShow({ id: 8, name: 'Pine', genres: ['Comedy'] })];

const PAGE_SIZE = 3;

/** What our server answers: a tiny copy of its genre filter and pagination. */
function fakeShowsPage(query: string, found: Show[], genre: string | null, page: number): ShowsPage {
  const genres = [...new Set(found.flatMap((show) => show.genres))].sort();
  const applied = genre && genres.includes(genre) ? genre : null;
  const filtered = applied ? found.filter((show) => show.genres.includes(applied)) : found;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const counts = { total: found.length, filteredTotal: filtered.length };
  return { query, genre: applied, page: current, totalPages, ...counts, genres, shows };
}

/** Answers GET /api/shows from the given table of found shows per query. */
export function stubShowsApi(found: Record<string, Show[]>) {
  const fetchMock = vi.fn(async (url: string) => {
    const params = new URL(url, 'http://localhost').searchParams;
    const query = params.get('q') ?? '';
    const page = Number(params.get('page') ?? 1);
    return okResponse(fakeShowsPage(query, found[query] ?? [], params.get('genre'), page));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Lets the debounce fire and the pending requests answer. */
export async function flushDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
  });
}

/** Lets the pending requests answer (genre and page requests are not debounced). */
export async function flushRequests() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

export const names = (shows: { name: string }[]) => shows.map((show) => show.name);
