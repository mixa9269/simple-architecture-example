import type { FavoritesAnswer, ToggleFavoriteAnswer } from '~shared/api';
import { callApi } from './callApi';

/** /api/favorites — the favorites of the given user, kept on the server. */
export const favorites = {
  /** All favorites of the user, newest first. */
  list: (user: string, signal?: AbortSignal) =>
    callApi<FavoritesAnswer>('/api/favorites', { user, signal }),

  /** Adds the show or removes it; the server decides which and answers with the whole list. */
  toggle: (user: string, showId: number) =>
    callApi<ToggleFavoriteAnswer>(`/api/favorites/${showId}/toggle`, { method: 'POST', user }),
};
