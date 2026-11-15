import type { FavoritesAnswer } from '~shared/api';
import { listFavorites } from '~/entities/favorites';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';

/** The favorite shows, newest first. */
export const getFavorites = (): ServerTaskResult<FavoritesAnswer> => {
  try {
    return success({ shows: listFavorites() });
  } catch (error) {
    return failure(error);
  }
};
