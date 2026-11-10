import type { Show } from './types';

export function filterByGenre(shows: Show[], genre: string | null): Show[] {
  if (!genre) return shows;
  return shows.filter((show) => show.genres.includes(genre));
}
