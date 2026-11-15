import type { ShowsPage, ShowsQuery } from '~shared/api';
import { queryChanged } from '~/entities/search/searchSlice';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { loadSearch } from './loadSearch';

/** Opens the search the page was opened with (query, genre and page read from the URL). */
export const restoreSearch = async (
  state: ShowsQuery,
): Promise<TaskResult<ShowsPage | null>> => {
  store.dispatch(queryChanged(state.query));
  if (!state.query) return success(null);
  return loadSearch({ query: state.query, genre: state.genre, page: state.page });
};
