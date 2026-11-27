import type { ToggleFavoriteAnswer } from '~shared/api';
import { addFavorite, hasFavorite, listFavorites, removeFavorite } from '~/entities/favorites';
import { failure, success, type ServerTaskResult } from '~/lib/taskResult';
import { loadCached } from '~/tasks/loadCached';
import { mapShow } from '~/tvmaze/mapShow';
import { tvmaze } from '~/tvmaze/tvmaze';
import { requireUser } from './requireUser';

/**
 * Adds a show to the user's favorites or removes it from there.
 * The show itself comes from TVmaze (through the cache), so the client sends only its id.
 */
export const toggleFavorite = async (
  email: string | null,
  id: number,
): Promise<ServerTaskResult<ToggleFavoriteAnswer>> => {
  try {
    const user = requireUser(email);
    if (!user.ok) return user;
    const owner = user.data;

    const removed = hasFavorite(owner, id) ? removeFavorite(owner, id) : undefined;
    if (removed) {
      return success({ show: removed, isFavorite: false, favorites: listFavorites(owner) });
    }

    const show = mapShow(await loadCached(`show:${id}`, () => tvmaze.shows.get(id)));
    addFavorite(owner, show);
    return success({ show, isFavorite: true, favorites: listFavorites(owner) });
  } catch (error) {
    return failure(error);
  }
};
