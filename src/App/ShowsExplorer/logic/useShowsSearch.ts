import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ShowsPage } from '~shared/api';
import type { SearchParams } from '~/App/ShowsExplorer/types';
import { getSearchStatus } from './getSearchStatus';
import type { SearchUrlState } from './searchUrl';
import { loadShowsPage } from './tasks/loadShowsPage';

export const SEARCH_DEBOUNCE_MS = 400;

interface Setters {
  setPage: Dispatch<SetStateAction<ShowsPage | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}

const toParams = ({ query, genre, page }: SearchUrlState): SearchParams | null =>
  query ? { query, genre, page } : null;

/** Loads a page and stores the answer, unless a newer load or a cleared field aborted it. */
async function fetchInto(params: SearchParams, own: AbortController, set: Setters) {
  const result = await loadShowsPage(params, own.signal);
  if (own.signal.aborted) return;
  set.setIsFetching(false);
  set.setPage(result.ok ? result.data : null);
  set.setError(result.ok ? null : result.error);
}

/**
 * The whole ShowsExplorer search: the field, what was asked, the last page and its error.
 * The last page stays on screen while the next query, genre or page loads.
 */
export function useShowsSearch(initial: SearchUrlState) {
  const [initialParams] = useState(() => toParams(initial));
  const [query, setQuery] = useState(initial.query);
  const [params, setParams] = useState(initialParams);
  const [page, setPage] = useState<ShowsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(initialParams !== null);
  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The search the page was opened with (from the URL).
  useEffect(() => {
    if (!initialParams) return;
    const own = new AbortController();
    controller.current = own;
    fetchInto(initialParams, own, { setPage, setError, setIsFetching });
    return () => own.abort();
  }, [initialParams]);

  useEffect(
    () => () => {
      controller.current?.abort();
      clearTimeout(timer.current);
    },
    [],
  );

  const load = (next: SearchParams) => {
    controller.current?.abort();
    const own = new AbortController();
    controller.current = own;
    setParams(next);
    setIsFetching(true);
    fetchInto(next, own, { setPage, setError, setIsFetching });
  };

  const changeQuery = (text: string) => {
    setQuery(text);
    clearTimeout(timer.current);
    const trimmed = text.trim();

    if (!trimmed) {
      controller.current?.abort();
      setParams(null);
      setPage(null);
      setError(null);
      setIsFetching(false);
      return;
    }

    // Typed back to the query on screen: nothing to send, genre and page stay.
    timer.current = setTimeout(() => {
      if (trimmed !== params?.query) load({ query: trimmed, genre: null, page: 1 });
    }, SEARCH_DEBOUNCE_MS);
  };

  return {
    query,
    params,
    page,
    error,
    isFetching,
    status: getSearchStatus({ query, params, isFetching, error }),
    changeQuery,
    selectGenre: (genre: string | null) => params && load({ ...params, genre, page: 1 }),
    selectPage: (next: number) => params && load({ ...params, page: next }),
    retry: () => params && load({ ...params }),
  };
}
