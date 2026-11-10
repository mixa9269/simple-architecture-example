import { useCallback, useEffect, useState } from 'react';
import { getSearchStatus } from './getSearchStatus';
import { searchShows } from './searchShows';
import type { SearchResult, Show } from './types';
import { useDebouncedValue } from './useDebouncedValue';

export const SEARCH_DEBOUNCE_MS = 400;

const NO_SHOWS: Show[] = [];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

/**
 * Searches TVmaze as the user types:
 * debounces the query, cancels outdated requests and exposes loading/error state.
 */
export function useShowsSearch() {
  const [query, setQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const requestKey = `${debouncedQuery}#${retryCount}`;

  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();
    const key = `${debouncedQuery}#${retryCount}`;

    searchShows(debouncedQuery, controller.signal)
      .then((shows) => {
        if (!controller.signal.aborted) setResult({ key, shows, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, shows: [], error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [debouncedQuery, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const status = getSearchStatus(trimmedQuery, debouncedQuery, requestKey, result);

  return {
    query,
    trimmedQuery,
    setQuery,
    status,
    shows: status === 'success' && result ? result.shows : NO_SHOWS,
    error: status === 'error' ? result?.error ?? null : null,
    retry,
  };
}
