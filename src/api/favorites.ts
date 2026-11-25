import type { FavoritesAnswer, ToggleFavoriteAnswer } from '~shared/api';
import { callApi } from './callApi';

/** /api/favorites — the favorites kept on the server. */
export const favorites = {
  /** All favorites, newest first. */
  list: (signal?: AbortSignal) => callApi<FavoritesAnswer>('/api/favorites', { signal }),

  /** Adds the show or removes it; the server decides which and answers with the whole list. */
  toggle: (showId: number) =>
    callApi<ToggleFavoriteAnswer>(`/api/favorites/${showId}/toggle`, { method: 'POST' }),
};
