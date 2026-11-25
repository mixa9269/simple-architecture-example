import { Pagination } from '@mantine/core';
import { GenreChips } from './GenreChips/GenreChips';
import { usePresenter } from './logic/usePresenter';
import { ResultsStatus } from './ResultsStatus/ResultsStatus';
import { SearchInput } from './SearchInput/SearchInput';
import { ShowsList } from './ShowsList/ShowsList';
import styles from './styles.module.css';

export function ShowsExplorer() {
  const { searchInput, resultsStatus, genreChips, showsList, pagination } = usePresenter();

  return (
    <section className={styles.explorer}>
      <SearchInput {...searchInput} />
      <ResultsStatus {...resultsStatus} />
      {genreChips && <GenreChips {...genreChips} />}
      <ShowsList {...showsList} />
      {pagination && (
        <div className={styles.pagination}>
          <Pagination {...pagination} withEdges />
        </div>
      )}
    </section>
  );
}
