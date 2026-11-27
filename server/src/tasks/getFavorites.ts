import type { FavoritesAnswer } from '~shared/api';
import { listFavorites } from '~/entities/favorites';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';
import { requireUser } from './requireUser';

/** The user's favorite shows, newest first. */
export const getFavorites = (email: string | null): ServerTaskResult<FavoritesAnswer> => {
  try {
    const user = requireUser(email);
    if (!user.ok) return user;
    return success({ shows: listFavorites(user.data) });
  } catch (error) {
    return failure(error);
  }
};
