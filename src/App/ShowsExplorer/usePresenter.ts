import { useMemo } from 'react';
import { buildResultsView } from './buildResultsView';
import { getUrlState } from './searchUrl';
import type { Show } from './types';
import { useSearchSelection } from './useSearchSelection';
import { useInitialSearchUrl, useSearchUrlSync } from './useSearchUrl';
import { useShowsSearch } from './useShowsSearch';

const NO_SHOWS: Show[] = [];

export function usePresenter() {
  const initial = useInitialSearchUrl();
  const search = useShowsSearch(initial.query);
  const shown = search.shownResult;
  const selection = useSearchSelection(shown, initial);
  const shows = shown?.shows ?? NO_SHOWS;
  const view = useMemo(
    () => buildResultsView(shows, selection.genre, selection.page),
    [shows, selection.genre, selection.page],
  );

  useSearchUrlSync(
    getUrlState(search.status, {
      query: search.trimmedQuery,
      genre: view.activeGenre,
      page: view.page,
    }),
  );

  const isLoading = search.status === 'loading';
  const hasResults = shows.length > 0;

  return {
    query: search.query,
    isLoading,
    onQueryChange: search.setQuery,
    onQueryClear: () => search.setQuery(''),

    status: search.status,
    // The query of the shown results, not of the one being typed.
    resultsQuery: shown?.query ?? search.trimmedQuery,
    error: search.error,
    onRetry: search.retry,
    totalCount: shows.length,
    filteredCount: view.filteredShows.length,

    showGenres: hasResults && view.genres.length > 0,
    genres: view.genres,
    selectedGenre: view.activeGenre,
    onGenreChange: selection.selectGenre,

    shows: view.pageItems,
    showSkeleton: isLoading && !hasResults,

    showPagination: hasResults && view.totalPages > 1,
    page: view.page,
    totalPages: view.totalPages,
    onPageChange: selection.setPage,
  };
}
