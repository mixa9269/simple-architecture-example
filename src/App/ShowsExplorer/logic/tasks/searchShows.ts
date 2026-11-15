import type { ShowsPage } from '~shared/api';
import { api } from '~/api/api';
import type { SearchRequest } from '~/App/ShowsExplorer/types';
import { failure, success, type TaskResult } from '~/lib/taskResult';

/** One page of shows for the request; the server finds, filters by genre and paginates. */
export const searchShows = async (
  request: SearchRequest,
  signal: AbortSignal,
): Promise<TaskResult<ShowsPage>> => {
  try {
    return success(await api.shows.search(request, signal));
  } catch (error) {
    return failure(error, signal);
  }
};
