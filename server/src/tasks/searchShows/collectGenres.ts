import type { Show } from '~shared/api';

export const collectGenres = (shows: Show[]): string[] => {
  const unique = new Set(shows.flatMap((show) => show.genres));
  return [...unique].sort((a, b) => a.localeCompare(b));
};
