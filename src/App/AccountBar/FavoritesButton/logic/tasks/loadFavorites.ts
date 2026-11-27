import { api, HttpError } from '~/api/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';
import { logOut } from '~/tasks/logOut';

/**
 * Loads the logged-in user's favorites into the store (nothing to load for a guest).
 * A server that no longer knows the user (e.g. after a restart) ends the session.
 */
export const loadFavorites = async (signal: AbortSignal): Promise<TaskResult<null>> => {
  const user = store.getState().session.email;
  if (!user) return success(null);

  try {
    const answer = await api.favorites.list(user, signal);
    if (!signal.aborted) store.dispatch(favoritesReceived(answer.shows));
    return success(null);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      logOut();
      return failure(new Error('Please log in again'), signal);
    }
    return failure(error, signal);
  }
};
