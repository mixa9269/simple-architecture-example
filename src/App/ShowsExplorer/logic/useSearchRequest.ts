import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchRequest } from '~/App/ShowsExplorer/types';
import type { SearchUrlState } from './searchUrl';

export const SEARCH_DEBOUNCE_MS = 400;

const toRequest = ({ query, genre, page }: SearchUrlState): SearchRequest | null =>
  query ? { query, genre, page } : null;

/**
 * The search field and the request it commits.
 * Typing is debounced in the handler; an emptied field drops the request at once.
 * The same query typed back keeps the same request object (with its genre and page), so nothing is sent again.
 * A genre or a page makes a new request at once.
 */
export function useSearchRequest(initial: SearchUrlState) {
  const [query, setQuery] = useState(initial.query);
  const [request, setRequest] = useState(() => toRequest(initial));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const changeQuery = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);

    const trimmed = value.trim();
    if (!trimmed) {
      setRequest(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      setRequest((current) =>
        current?.query === trimmed ? current : { query: trimmed, genre: null, page: 1 },
      );
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const selectGenre = useCallback((genre: string | null) => {
    setRequest((current) => current && { query: current.query, genre, page: 1 });
  }, []);

  const selectPage = useCallback((page: number) => {
    setRequest((current) => current && { ...current, page });
  }, []);

  const retry = useCallback(() => {
    setRequest((current) => current && { ...current });
  }, []);

  return { query, request, changeQuery, selectGenre, selectPage, retry };
}
