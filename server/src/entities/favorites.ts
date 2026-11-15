import type { Show } from '~shared/api';

interface FavoriteEntry {
  show: Show;
  /** Grows with every add: keys of `favorite` are ids and iterate by id, not by the time of adding. */
  order: number;
}

/** In-memory favorites, keyed by show id. */
const favorite: Record<number, FavoriteEntry> = {};
let nextOrder = 0;

export function hasFavorite(id: number): boolean {
  return id in favorite;
}

export function addFavorite(show: Show) {
  favorite[show.id] = { show, order: nextOrder++ };
}

export function removeFavorite(id: number): Show | undefined {
  const entry = favorite[id];
  delete favorite[id];
  return entry?.show;
}

/** Newest first. */
export function listFavorites(): Show[] {
  return Object.values(favorite)
    .sort((a, b) => b.order - a.order)
    .map((entry) => entry.show);
}

/** Tests only: start with no favorites. */
export function clearFavorites() {
  for (const id of Object.keys(favorite)) delete favorite[Number(id)];
}
