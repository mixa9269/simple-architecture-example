import type { Show } from './types';

export function collectGenres(shows: Show[]): string[] {
  const unique = new Set(shows.flatMap((show) => show.genres));
  return [...unique].sort((a, b) => a.localeCompare(b));
}
