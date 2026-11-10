import { useCallback, useMemo, useState } from 'react';
import { clampPage, getTotalPages, paginate } from './paginate';

export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);

  const totalPages = getTotalPages(items.length);
  const currentPage = clampPage(page, totalPages);
  const pageItems = useMemo(() => paginate(items, currentPage), [items, currentPage]);

  const reset = useCallback(() => setPage(1), []);

  return {
    page: currentPage,
    totalPages,
    pageItems,
    setPage,
    reset,
  };
}
