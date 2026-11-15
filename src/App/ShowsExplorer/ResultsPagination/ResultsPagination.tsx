import { Pagination } from '@mantine/core';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function ResultsPagination() {
  const { isHidden, page, totalPages, onChange } = usePresenter();

  if (isHidden) return null;

  return (
    <div className={styles.pagination}>
      <Pagination value={page} total={totalPages} onChange={onChange} withEdges />
    </div>
  );
}
