import type { ToggleFavoriteAnswer } from '~shared/api';
import { addFavorite, hasFavorite, listFavorites, removeFavorite } from '~/entities/favorites';
import { loadCached } from '~/tasks/loadCached';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';
import { mapShow } from '~/tvmaze/mapShow';
import { tvmaze } from '~/tvmaze/tvmaze';

/**
 * Adds a show to favorites or removes it from there.
 * The show itself comes from TVmaze (through the cache), so the client sends only its id.
 */
export const toggleFavorite = async (
  id: number,
): Promise<ServerTaskResult<ToggleFavoriteAnswer>> => {
  try {
    const removed = hasFavorite(id) ? removeFavorite(id) : undefined;
    if (removed) return success({ show: removed, isFavorite: false, favorites: listFavorites() });

    const show = mapShow(await loadCached(`show:${id}`, () => tvmaze.shows.get(id)));
    addFavorite(show);
    return success({ show, isFavorite: true, favorites: listFavorites() });
  } catch (error) {
    return failure(error);
  }
};
