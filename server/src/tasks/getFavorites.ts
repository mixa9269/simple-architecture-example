import type { FavoritesAnswer } from '~shared/api';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';
import { listNewestFirst } from './listNewestFirst';
import { requireUser } from './requireUser';

/** The user's favorite shows, newest first. */
export const getFavorites = (email: string | null): ServerTaskResult<FavoritesAnswer> => {
  try {
    const user = requireUser(email);
    if (!user.ok) return user;
    return success({ shows: listNewestFirst(user.data) });
  } catch (error) {
    return failure(error);
  }
};
