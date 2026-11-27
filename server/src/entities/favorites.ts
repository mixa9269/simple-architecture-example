import type { Show } from '~shared/api';

export interface FavoriteEntry {
  show: Show;
  /** Grows with every add: keys of a list are ids and iterate by id, not by the time of adding. */
  order: number;
}

/** In-memory favorites of every user: email → show id → entry. Get/set only; rules live in tasks. */
const favorite: Record<string, Record<number, FavoriteEntry>> = {};
let nextOrder = 0;

export function hasFavorite(email: string, id: number): boolean {
  return favorite[email]?.[id] !== undefined;
}

export function addFavorite(email: string, show: Show) {
  favorite[email] ??= {};
  favorite[email][show.id] = { show, order: nextOrder++ };
}

export function removeFavorite(email: string, id: number): Show | undefined {
  const entry = favorite[email]?.[id];
  if (entry) delete favorite[email][id];
  return entry?.show;
}

/** The user's entries, in no particular order. */
export function listFavorites(email: string): FavoriteEntry[] {
  return Object.values(favorite[email] ?? {});
}

/** Tests only: start with no favorites. */
export function clearFavorites() {
  for (const email of Object.keys(favorite)) delete favorite[email];
}
