import type { ShowsPage } from '~shared/api';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { loadSearch } from './loadSearch';

/** Opens another page of the found shows. */
export const selectPage = async (page: number): Promise<TaskResult<ShowsPage | null>> => {
  const { request } = store.getState().search;
  if (!request) return success(null);
  return loadSearch({ ...request, page });
};
