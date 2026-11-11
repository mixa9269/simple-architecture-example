import { useCallback, useEffect, useRef, useState } from 'react';
import { getSearchStatus } from './getSearchStatus';
import { getShownResult } from './getShownResult';
import { searchShows } from './searchShows';
import type { SearchResult } from './types';
import { useDebouncedQuery } from './useDebouncedQuery';

export const SEARCH_DEBOUNCE_MS = 400;
export const FIRST_RESULT_ID = 1;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

/**
 * Searches TVmaze as the user types:
 * debounces the query, cancels outdated requests and exposes loading/error state.
 */
export function useShowsSearch(initialQuery: string) {
  const [query, setQuery] = useState(initialQuery);
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const lastResultId = useRef(FIRST_RESULT_ID - 1);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedQuery(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const requestKey = `${debouncedQuery}#${retryCount}`;

  // An emptied field drops the answer: the next query loads with skeletons, not with old shows.
  if (!trimmedQuery && result) setResult(null);

  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();
    const base = { key: `${debouncedQuery}#${retryCount}`, query: debouncedQuery };
    const settle = (answer: Pick<SearchResult, 'shows' | 'error'>) => {
      if (controller.signal.aborted) return;
      lastResultId.current += 1;
      setResult({ id: lastResultId.current, ...base, ...answer });
    };

    searchShows(debouncedQuery, controller.signal)
      .then((shows) => settle({ shows, error: null }))
      .catch((error: unknown) => settle({ shows: [], error: getErrorMessage(error) }));

    return () => controller.abort();
  }, [debouncedQuery, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const status = getSearchStatus(trimmedQuery, debouncedQuery, requestKey, result);

  return {
    query,
    trimmedQuery,
    setQuery,
    status,
    shownResult: getShownResult(status, result),
    error: status === 'error' ? (result?.error ?? null) : null,
    retry,
  };
}
