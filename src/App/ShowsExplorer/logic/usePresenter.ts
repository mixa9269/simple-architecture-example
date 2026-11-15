import type { Show } from '~/App/ShowsExplorer/types';
import { getSelection } from './getSelection';
import { getUrlState } from './searchUrl';
import { useInitialSearchUrl, useSearchUrlSync } from './useSearchUrl';
import { useShowsSearch } from './useShowsSearch';

const NO_SHOWS: Show[] = [];
const NO_GENRES: string[] = [];

export function usePresenter() {
  const initial = useInitialSearchUrl();
  const search = useShowsSearch(initial);
  const shown = search.shownAnswer;
  const result = shown?.result ?? null;
  const selection = getSelection(search.status, search.request, result);

  useSearchUrlSync(
    getUrlState(search.status, {
      query: search.trimmedQuery,
      genre: result?.genre ?? null,
      page: result?.page ?? 1,
    }),
  );

  const isLoading = search.status === 'loading';
  const totalCount = result?.total ?? 0;
  const hasResults = totalCount > 0;
  const genres = result?.genres ?? NO_GENRES;
  const totalPages = result?.totalPages ?? 1;

  return {
    query: search.query,
    isLoading,
    onQueryChange: search.changeQuery,
    onQueryClear: () => search.changeQuery(''),

    status: search.status,
    // The query and genre of the shown results, not of the ones being typed or loaded.
    resultsQuery: shown?.request.query ?? search.trimmedQuery,
    resultsGenre: result?.genre ?? null,
    error: search.error,
    onRetry: search.retry,
    totalCount,
    filteredCount: result?.filteredTotal ?? 0,

    showGenres: hasResults && genres.length > 0,
    genres,
    selectedGenre: selection.genre,
    onGenreChange: search.selectGenre,

    shows: result?.shows ?? NO_SHOWS,
    showSkeleton: isLoading && !hasResults,

    showPagination: hasResults && totalPages > 1,
    page: selection.page,
    totalPages,
    onPageChange: search.selectPage,
  };
}
