import { useGenreFilter } from './useGenreFilter';
import { usePagination } from './usePagination';
import { useShowsSearch } from './useShowsSearch';

export function usePresenter() {
  const search = useShowsSearch();
  const genre = useGenreFilter(search.shows);
  const pagination = usePagination(genre.filteredShows);

  const onQueryChange = (value: string) => {
    search.setQuery(value);
    genre.reset();
    pagination.reset();
  };

  const onGenreChange = (value: string | null) => {
    genre.select(value);
    pagination.reset();
  };

  const hasResults = search.status === 'success' && search.shows.length > 0;

  return {
    query: search.query,
    trimmedQuery: search.trimmedQuery,
    isLoading: search.status === 'loading',
    onQueryChange,
    onQueryClear: () => onQueryChange(''),

    status: search.status,
    error: search.error,
    onRetry: search.retry,
    totalCount: search.shows.length,
    filteredCount: genre.filteredShows.length,

    showGenres: hasResults && genre.genres.length > 0,
    genres: genre.genres,
    selectedGenre: genre.selectedGenre,
    onGenreChange,

    shows: pagination.pageItems,

    showPagination: hasResults && pagination.totalPages > 1,
    page: pagination.page,
    totalPages: pagination.totalPages,
    onPageChange: pagination.setPage,
  };
}
