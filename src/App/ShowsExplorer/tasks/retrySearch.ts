import type { ShowsPage } from '~shared/api';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { loadSearch } from './loadSearch';

/** Repeats the failed request: a new request object with the same values. */
export const retrySearch = async (): Promise<TaskResult<ShowsPage | null>> => {
  const { request } = store.getState().search;
  if (!request) return success(null);
  return loadSearch({ ...request });
};
