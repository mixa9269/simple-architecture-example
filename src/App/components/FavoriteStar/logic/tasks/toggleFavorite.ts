import type { Show } from '~shared/api';
import { api, HttpError } from '~/api/api';
import { favoritesReceived, selectFavorites } from '~/entities/favorites/favoritesSlice';
import { selectUserEmail } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';
import { logOut } from '~/tasks/logOut';
import { toggleInList } from './toggleInList';

export interface ToggleResult {
  show: Show;
  isFavorite: boolean;
}

/** Flips the show in the store's list right away (optimistic UI). */
const flip = (show: Show) =>
  store.dispatch(favoritesReceived(toggleInList(selectFavorites(store.getState()), show)));

/**
 * Adds a show to the user's favorites or removes it from there.
 * The star changes at once; the server's answer then replaces the whole list.
 * If the server fails, only this show is flipped back (other stars toggled meanwhile stay).
 */
export const toggleFavorite = async (show: Show): Promise<TaskResult<ToggleResult>> => {
  const user = selectUserEmail(store.getState());
  if (!user) return { ok: false, error: 'Log in to add favorites' };

  flip(show);
  try {
    const answer = await api.favorites.toggle(user, show.id);
    store.dispatch(favoritesReceived(answer.favorites));
    return success({ show: answer.show, isFavorite: answer.isFavorite });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      logOut();
      return failure(new Error('Please log in again'));
    }
    flip(show);
    return failure(error);
  }
};
