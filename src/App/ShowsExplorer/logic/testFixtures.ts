import type { SearchAnswer, ShowsPage } from '~/App/ShowsExplorer/types';

export { errorResponse, makeShow, okResponse } from '~/testUtils/fixtures';

/** A server answer; by default a single page with the given shows. */
export function makeShowsPage(overrides: Partial<ShowsPage> = {}): ShowsPage {
  const shows = overrides.shows ?? [];
  return {
    query: 'murder',
    genre: null,
    page: 1,
    totalPages: 1,
    total: shows.length,
    filteredTotal: shows.length,
    genres: [...new Set(shows.flatMap((show) => show.genres))].sort(),
    shows,
    ...overrides,
  };
}

export function makeAnswer(overrides: Partial<SearchAnswer> = {}): SearchAnswer {
  return {
    request: { query: 'murder', genre: null, page: 1 },
    result: makeShowsPage(),
    error: null,
    ...overrides,
  };
}
