import type { Show } from '~shared/api';
import { api } from '~/api/api';
import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';

export interface ToggleResult {
  show: Show;
  isFavorite: boolean;
}

/**
 * Adds a show to favorites or removes it from there.
 * The server decides which one and answers with the whole list; the store mirrors it.
 */
export const toggleFavorite = async (showId: number): Promise<TaskResult<ToggleResult>> => {
  try {
    const answer = await api.favorites.toggle(showId);
    store.dispatch(favoritesReceived(answer.favorites));
    return success({ show: answer.show, isFavorite: answer.isFavorite });
  } catch (error) {
    return failure(error);
  }
};
