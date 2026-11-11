import { collectGenres } from './collectGenres';
import { filterByGenre } from './filterByGenre';
import { clampPage, getTotalPages, paginate } from './paginate';
import type { Show } from './types';

/** Genres, the genre filter and the current page of the shown shows. */
export function buildResultsView(shows: Show[], genre: string | null, page: number) {
  const genres = collectGenres(shows);
  // A genre that is missing from the shown results is treated as "no filter".
  const activeGenre = genre && genres.includes(genre) ? genre : null;
  const filteredShows = filterByGenre(shows, activeGenre);
  const totalPages = getTotalPages(filteredShows.length);
  const currentPage = clampPage(page, totalPages);

  return {
    genres,
    activeGenre,
    filteredShows,
    totalPages,
    page: currentPage,
    pageItems: paginate(filteredShows, currentPage),
  };
}
