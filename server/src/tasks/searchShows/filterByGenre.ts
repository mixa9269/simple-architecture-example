import type { Show } from '~shared/api';

export const filterByGenre = (shows: Show[], genre: string | null): Show[] =>
  genre ? shows.filter((show) => show.genres.includes(genre)) : shows;
