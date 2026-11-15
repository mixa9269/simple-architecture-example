import type { Show, ShowsPage } from '~shared/api';
import { collectGenres } from './collectGenres';
import { filterByGenre } from './filterByGenre';
import { clampPage, getTotalPages, paginate } from './paginate';

/** One page of the found shows, filtered by genre. */
export const buildShowsPage = (
  query: string,
  shows: Show[],
  genre: string | null,
  page: number,
): ShowsPage => {
  const genres = collectGenres(shows);
  // A genre that is missing from the found shows is treated as "no filter".
  const appliedGenre = genre && genres.includes(genre) ? genre : null;
  const filtered = filterByGenre(shows, appliedGenre);
  const totalPages = getTotalPages(filtered.length);
  const appliedPage = clampPage(page, totalPages);

  return {
    query,
    genre: appliedGenre,
    page: appliedPage,
    totalPages,
    total: shows.length,
    filteredTotal: filtered.length,
    genres,
    shows: paginate(filtered, appliedPage),
  };
};
