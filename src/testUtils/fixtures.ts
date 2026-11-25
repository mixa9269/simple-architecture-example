import type { Show } from '~shared/api';

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

export const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as Response;

export const errorResponse = (status: number, body: unknown = {}) =>
  ({ ok: false, status, json: async () => body }) as Response;
