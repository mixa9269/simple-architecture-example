import { useCallback, useEffect, useState } from 'react';
import { getSearchStatus } from './getSearchStatus';
import { getShownAnswer } from './getShownAnswer';
import { searchShows } from './searchShows';
import type { SearchAnswer } from './types';
import { useSearchQuery } from './useSearchQuery';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

/**
 * Searches TVmaze as the user types.
 * The effect loads the current request; AbortController cancels the outdated one.
 */
export function useShowsSearch(initialQuery: string) {
  const search = useSearchQuery(initialQuery);
  const { request } = search;
  const [answer, setAnswer] = useState<SearchAnswer | null>(null);

  useEffect(() => {
    if (!request) return;

    const controller = new AbortController();
    const settle = (shows: SearchAnswer['shows'], error: string | null) => {
      if (!controller.signal.aborted) setAnswer({ request, shows, error });
    };

    searchShows(request.query, controller.signal)
      .then((shows) => settle(shows, null))
      .catch((error: unknown) => settle([], getErrorMessage(error)));

    return () => controller.abort();
  }, [request]);

  const { changeQuery: commitQuery } = search;
  // An emptied field also drops the answer: the next query loads with skeletons, not with old shows.
  const changeQuery = useCallback(
    (value: string) => {
      commitQuery(value);
      if (!value.trim()) setAnswer(null);
    },
    [commitQuery],
  );

  const trimmedQuery = search.query.trim();
  const status = getSearchStatus(trimmedQuery, request, answer);

  return {
    query: search.query,
    trimmedQuery,
    request,
    changeQuery,
    status,
    shownAnswer: getShownAnswer(status, answer),
    error: status === 'error' ? (answer?.error ?? null) : null,
    retry: search.retry,
  };
}
