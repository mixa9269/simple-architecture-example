import type { SearchAnswer, Show, TvmazeSearchItem, TvmazeShow } from './types';

export function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Murder, She Wrote',
    genres: ['Drama', 'Crime'],
    imageUrl: null,
    year: '1984',
    rating: 7.9,
    summary: 'A mystery writer solves crimes.',
    url: 'https://www.tvmaze.com/shows/1',
    ...overrides,
  };
}

export function makeTvmazeShow(overrides: Partial<TvmazeShow> = {}): TvmazeShow {
  return {
    id: 1,
    name: 'Murder, She Wrote',
    genres: ['Drama', 'Crime'],
    image: { medium: 'https://img/medium.jpg', original: 'https://img/original.jpg' },
    premiered: '1984-09-30',
    rating: { average: 7.9 },
    summary: '<p>A <b>mystery</b> writer &amp; sleuth.</p>',
    url: 'https://www.tvmaze.com/shows/1',
    ...overrides,
  };
}

export function makeSearchItem(
  id: number,
  name: string,
  genres: string[] = ['Drama', 'Crime'],
): TvmazeSearchItem {
  return { score: 1, show: makeTvmazeShow({ id, name, genres }) };
}

export function makeAnswer(overrides: Partial<SearchAnswer> = {}): SearchAnswer {
  return { request: { query: 'murder' }, shows: [], error: null, ...overrides };
}

export const okResponse = (items: unknown[]) =>
  ({ ok: true, status: 200, json: async () => items }) as Response;

export const errorResponse = (status: number) =>
  ({ ok: false, status, json: async () => ({}) }) as Response;
