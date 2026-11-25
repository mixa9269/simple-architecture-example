import type { ShowsQuery } from '~shared/api';
import { badRequest, success, type ServerTaskResult } from '~/lib/taskResult';

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** `?q=&genre=&page=` → the input of searchShows; q is required, a bad page means page 1. */
export const parseShowsQuery = (query: Record<string, unknown>): ServerTaskResult<ShowsQuery> => {
  const q = asString(query.q);
  if (!q) return badRequest('Query parameter "q" is required');

  const page = Number(asString(query.page));
  return success({
    query: q,
    genre: asString(query.genre) || null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  });
};

/** `:id` of a show → a positive integer. */
export const parseShowId = (value: string): ServerTaskResult<number> => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? success(id) : badRequest('Show id must be a positive integer');
};
