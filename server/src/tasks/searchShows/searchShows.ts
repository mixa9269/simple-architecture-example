import type { ShowsPage, ShowsQuery } from '~shared/api';
import { loadCached } from '~/tasks/loadCached';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';
import { mapShow } from '~/tvmaze/mapShow';
import { tvmaze } from '~/tvmaze/tvmaze';
import { buildShowsPage } from './buildShowsPage';

/**
 * Finds shows on TVmaze and returns one page of them, filtered by genre.
 * The query is normalized, so "Girls" and " girls " share one TVmaze request (and one cache entry).
 */
export const searchShows = async (input: ShowsQuery): Promise<ServerTaskResult<ShowsPage>> => {
  try {
    const query = input.query.trim();
    const normalized = query.toLowerCase();
    const items = await loadCached(`search:${normalized}`, () => tvmaze.shows.search(normalized));
    const shows = items.map((item) => mapShow(item.show));
    return success(buildShowsPage(query, shows, input.genre, input.page));
  } catch (error) {
    return failure(error);
  }
};
