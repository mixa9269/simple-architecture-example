import { useState } from 'react';
import type { Show } from '~shared/api';
import type { Props as GenreChipsProps } from '~/App/ShowsExplorer/GenreChips/types';
import type { Props as ResultsStatusProps } from '~/App/ShowsExplorer/ResultsStatus/types';
import type { Props as SearchInputProps } from '~/App/ShowsExplorer/SearchInput/types';
import type { Props as ShowsListProps } from '~/App/ShowsExplorer/ShowsList/types';
import { getUrlState, readSearchUrl } from './searchUrl';
import { useSearchUrl } from './useSearchUrl';
import { useShowsSearch } from './useShowsSearch';

const NO_SHOWS: Show[] = [];

/** Owns the search; hands every child exactly the props its contract asks for. */
export function usePresenter() {
  const [initial] = useState(() => readSearchUrl(window.location.search));
  const search = useShowsSearch(initial);
  const { page, params, isFetching, status } = search;
  const typed = search.query.trim();
  const hasResults = (page?.total ?? 0) > 0;
  // While fetching: what was asked (the controls react at once). After: what the server applied.
  const selection = isFetching && params ? params : { genre: page?.genre ?? null, page: page?.page ?? 1 };

  useSearchUrl(getUrlState(status, { query: typed, genre: page?.genre ?? null, page: page?.page ?? 1 }));

  const searchInput: SearchInputProps = {
    value: search.query,
    isLoading: status === 'loading',
    onChange: search.changeQuery,
    onClear: () => search.changeQuery(''),
  };

  const resultsStatus: ResultsStatusProps = {
    status,
    // The query and genre of the shown results, not of the ones being typed or loaded.
    query: page?.query ?? typed,
    genre: page?.genre ?? null,
    error: search.error,
    totalCount: page?.total ?? 0,
    filteredCount: page?.filteredTotal ?? 0,
    waitingFor: isFetching ? params : null,
    onRetry: search.retry,
  };

  const genreChips: GenreChipsProps | null =
    page && hasResults && page.genres.length > 0
      ? { genres: page.genres, selectedGenre: selection.genre, onChange: search.selectGenre }
      : null;

  const showsList: ShowsListProps = {
    shows: page?.shows ?? NO_SHOWS,
    showSkeleton: status === 'loading' && !hasResults,
  };

  const pagination =
    page && hasResults && page.totalPages > 1
      ? { value: selection.page, total: page.totalPages, onChange: search.selectPage }
      : null;

  return { searchInput, resultsStatus, genreChips, showsList, pagination };
}
