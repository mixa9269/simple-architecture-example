import { api } from '~/api/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';

/** Loads the favorites kept on the server into the store. */
export const loadFavorites = async (signal: AbortSignal): Promise<TaskResult<null>> => {
  try {
    const answer = await api.favorites.list(signal);
    if (!signal.aborted) store.dispatch(favoritesReceived(answer.shows));
    return success(null);
  } catch (error) {
    return failure(error, signal);
  }
};
