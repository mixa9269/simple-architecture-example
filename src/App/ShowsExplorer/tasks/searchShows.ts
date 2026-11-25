import type { ShowsPage } from '~shared/api';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { loadSearch } from './loadSearch';

/**
 * Searches shows for the typed query (called after the debounce).
 * The same query typed back keeps the current request, with its genre and page: nothing is sent.
 */
export const searchShows = async (query: string): Promise<TaskResult<ShowsPage | null>> => {
  const { request } = store.getState().search;
  if (request?.query === query) return success(null);
  return loadSearch({ query, genre: null, page: 1 });
};
