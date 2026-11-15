import { useCallback, useEffect, useState } from 'react';
import type { SearchAnswer, ShowsPage } from '~/App/ShowsExplorer/types';
import { getSearchStatus } from './getSearchStatus';
import { getShownAnswer } from './getShownAnswer';
import type { SearchUrlState } from './searchUrl';
import { searchShows } from './tasks/searchShows';
import { useSearchRequest } from './useSearchRequest';

/**
 * Searches shows on our server as the user types, picks a genre or a page.
 * The effect loads the current request; AbortController cancels the outdated one.
 */
export function useShowsSearch(initial: SearchUrlState) {
  const search = useSearchRequest(initial);
  const { request } = search;
  const [answer, setAnswer] = useState<SearchAnswer | null>(null);

  useEffect(() => {
    if (!request) return;

    const controller = new AbortController();
    const settle = (result: ShowsPage | null, error: string | null) => {
      if (!controller.signal.aborted) setAnswer({ request, result, error });
    };

    searchShows(request, controller.signal).then((result) =>
      result.ok ? settle(result.data, null) : settle(null, result.error),
    );

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
    selectGenre: search.selectGenre,
    selectPage: search.selectPage,
    status,
    shownAnswer: getShownAnswer(status, answer),
    error: status === 'error' ? (answer?.error ?? null) : null,
    retry: search.retry,
  };
}
