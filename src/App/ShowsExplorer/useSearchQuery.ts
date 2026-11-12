import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchRequest } from './types';

export const SEARCH_DEBOUNCE_MS = 400;

/**
 * The search field and the request it commits.
 * Typing is debounced in the handler; an emptied field drops the request at once.
 * The same query typed back keeps the same request object, so nothing is sent again.
 */
export function useSearchQuery(initialQuery: string) {
  const [query, setQuery] = useState(initialQuery);
  const [request, setRequest] = useState<SearchRequest | null>(() =>
    initialQuery ? { query: initialQuery } : null,
  );
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
      setRequest((current) => (current?.query === trimmed ? current : { query: trimmed }));
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const retry = useCallback(() => {
    setRequest((current) => current && { query: current.query });
  }, []);

  return { query, request, changeQuery, retry };
}
