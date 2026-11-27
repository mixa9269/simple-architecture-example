import type { Show } from '~shared/api';

interface FavoriteEntry {
  show: Show;
  /** Grows with every add: keys of a list are ids and iterate by id, not by the time of adding. */
  order: number;
}

/** In-memory favorites of every user: email → show id → entry. */
const favorite: Record<string, Record<number, FavoriteEntry>> = {};
let nextOrder = 0;

const listOf = (email: string) => (favorite[email] ??= {});

export function hasFavorite(email: string, id: number): boolean {
  return id in listOf(email);
}

export function addFavorite(email: string, show: Show) {
  listOf(email)[show.id] = { show, order: nextOrder++ };
}

export function removeFavorite(email: string, id: number): Show | undefined {
  const list = listOf(email);
  const entry = list[id];
  delete list[id];
  return entry?.show;
}

/** Newest first. */
export function listFavorites(email: string): Show[] {
  return Object.values(listOf(email))
    .sort((a, b) => b.order - a.order)
    .map((entry) => entry.show);
}

/** Tests only: start with no favorites. */
export function clearFavorites() {
  for (const email of Object.keys(favorite)) delete favorite[email];
}
