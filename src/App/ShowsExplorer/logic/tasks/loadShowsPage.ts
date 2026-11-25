import type { ShowsPage } from '~shared/api';
import { api } from '~/api/api';
import type { SearchParams } from '~/App/ShowsExplorer/types';
import { failure, success, type TaskResult } from '~/lib/taskResult';

/**
 * One page of shows for the search parameters; the server finds, filters by genre and paginates.
 * Contract designed by the ShowsExplorer presenter: parameters in, a page or an error out.
 */
export const loadShowsPage = async (
  params: SearchParams,
  signal: AbortSignal,
): Promise<TaskResult<ShowsPage>> => {
  try {
    return success(await api.shows.search(params, signal));
  } catch (error) {
    return failure(error, signal);
  }
};
