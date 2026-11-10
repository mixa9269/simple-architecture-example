import { Pagination } from '@mantine/core';
import { GenreChips } from './GenreChips/GenreChips';
import { ResultsStatus } from './ResultsStatus/ResultsStatus';
import { SearchInput } from './SearchInput/SearchInput';
import { ShowsList } from './ShowsList/ShowsList';
import styles from './styles.module.css';
import { usePresenter } from './usePresenter';

export function ShowsExplorer() {
  const {
    query,
    trimmedQuery,
    isLoading,
    onQueryChange,
    onQueryClear,
    status,
    error,
    onRetry,
    totalCount,
    filteredCount,
    showGenres,
    genres,
    selectedGenre,
    onGenreChange,
    shows,
    showPagination,
    page,
    totalPages,
    onPageChange,
  } = usePresenter();

  return (
    <section className={styles.explorer}>
      <SearchInput
        value={query}
        isLoading={isLoading}
        onChange={onQueryChange}
        onClear={onQueryClear}
      />

      <ResultsStatus
        status={status}
        query={trimmedQuery}
        error={error}
        totalCount={totalCount}
        filteredCount={filteredCount}
        selectedGenre={selectedGenre}
        onRetry={onRetry}
      />

      {showGenres && (
        <GenreChips genres={genres} selectedGenre={selectedGenre} onChange={onGenreChange} />
      )}

      <ShowsList shows={shows} isLoading={isLoading} />

      {showPagination && (
        <div className={styles.pagination}>
          <Pagination value={page} total={totalPages} onChange={onPageChange} withEdges />
        </div>
      )}
    </section>
  );
}
