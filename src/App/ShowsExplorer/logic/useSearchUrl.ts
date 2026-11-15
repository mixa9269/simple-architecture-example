import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { restoreSearch } from '~/App/ShowsExplorer/tasks/restoreSearch';
import {
  selectSearchQuery,
  selectSearchStatus,
  selectShownResult,
} from '~/entities/search/searchSelectors';
import { buildSearchUrl, getUrlState, readSearchUrl, type SearchUrlState } from './searchUrl';

/**
 * Opens the search from the URL once, then keeps the URL in sync with the settled search.
 * Until the restore is done nothing is written, so the empty first render can't wipe the URL.
 */
export function useSearchUrl() {
  const [isRestored, setIsRestored] = useState(false);
  const status = useSelector(selectSearchStatus);
  const query = useSelector(selectSearchQuery).trim();
  const result = useSelector(selectShownResult);

  useEffect(() => {
    restoreSearch(readSearchUrl(window.location.search)).then(() => setIsRestored(true));
  }, []);

  const state = getUrlState(status, {
    query,
    genre: result?.genre ?? null,
    page: result?.page ?? 1,
  });
  useSearchUrlSync(isRestored ? state : null);
}

/** Keeps the URL in sync with the search state (null = keep the URL as is). */
function useSearchUrlSync(state: SearchUrlState | null) {
  const search = state ? buildSearchUrl(state) : null;

  useEffect(() => {
    if (search === null || search === window.location.search) return;
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
  }, [search]);
}
