import type { ShowsPage } from '~shared/api';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { loadSearch } from './loadSearch';

/** Filters the found shows by a genre (null = all); a new genre opens on page 1. */
export const selectGenre = async (genre: string | null): Promise<TaskResult<ShowsPage | null>> => {
  const { request } = store.getState().search;
  if (!request) return success(null);
  return loadSearch({ query: request.query, genre, page: 1 });
};
