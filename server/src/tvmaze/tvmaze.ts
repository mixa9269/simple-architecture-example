import { requestTvmaze } from './requestTvmaze';
import type { TvmazeSearchItem, TvmazeShow } from './types';

/**
 * The TVmaze API, grouped by domain: `await tvmaze.shows.search(query)`.
 * Only tasks call it (see .claude/rules/sa-api-layer.md).
 */
export const tvmaze = {
  shows: {
    search: (query: string) =>
      requestTvmaze<TvmazeSearchItem[]>(`/search/shows?q=${encodeURIComponent(query)}`),

    get: (id: number) => requestTvmaze<TvmazeShow>(`/shows/${id}`),
  },
};
