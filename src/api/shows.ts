import type { ShowsPage, ShowsQuery } from '~shared/api';
import { callApi } from './callApi';

/** /api/shows — the search. */
export const shows = {
  /** One page of shows for the query; the server finds, filters by genre and paginates. */
  search: (query: ShowsQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams({ q: query.query });
    if (query.genre) params.set('genre', query.genre);
    if (query.page > 1) params.set('page', String(query.page));

    return callApi<ShowsPage>(`/api/shows?${params}`, { signal });
  },
};
