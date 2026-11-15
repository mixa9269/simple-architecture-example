import { GenreChips } from './GenreChips/GenreChips';
import { usePresenter } from './logic/usePresenter';
import { ResultsPagination } from './ResultsPagination/ResultsPagination';
import { ResultsStatus } from './ResultsStatus/ResultsStatus';
import { SearchInput } from './SearchInput/SearchInput';
import { ShowsList } from './ShowsList/ShowsList';
import styles from './styles.module.css';

/** Layout of the search; every part reads the search store and calls its tasks itself. */
export function ShowsExplorer() {
  usePresenter();

  return (
    <section className={styles.explorer}>
      <SearchInput />
      <ResultsStatus />
      <GenreChips />
      <ShowsList />
      <ResultsPagination />
    </section>
  );
}
