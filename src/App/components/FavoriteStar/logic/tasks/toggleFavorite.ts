import type { Show } from '~shared/api';
import { api, HttpError } from '~/api/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';
import { logOut } from '~/tasks/logOut';

export interface ToggleResult {
  show: Show;
  isFavorite: boolean;
}

/**
 * Adds a show to the user's favorites or removes it from there.
 * The server decides which one and answers with the whole list; the store mirrors it.
 */
export const toggleFavorite = async (showId: number): Promise<TaskResult<ToggleResult>> => {
  const user = store.getState().session.email;
  if (!user) return { ok: false, error: 'Log in to add favorites' };

  try {
    const answer = await api.favorites.toggle(user, showId);
    store.dispatch(favoritesReceived(answer.favorites));
    return success({ show: answer.show, isFavorite: answer.isFavorite });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      logOut();
      return failure(new Error('Please log in again'));
    }
    return failure(error);
  }
};
