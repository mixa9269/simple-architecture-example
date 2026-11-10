import { useCallback, useMemo, useState } from 'react';
import { collectGenres } from './collectGenres';
import { filterByGenre } from './filterByGenre';
import type { Show } from './types';

export function useGenreFilter(shows: Show[]) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = useMemo(() => collectGenres(shows), [shows]);
  // A genre that is missing from the current results is treated as "no filter".
  const activeGenre = selectedGenre && genres.includes(selectedGenre) ? selectedGenre : null;
  const filteredShows = useMemo(() => filterByGenre(shows, activeGenre), [shows, activeGenre]);

  const reset = useCallback(() => setSelectedGenre(null), []);

  return {
    genres,
    selectedGenre: activeGenre,
    filteredShows,
    select: setSelectedGenre,
    reset,
  };
}
