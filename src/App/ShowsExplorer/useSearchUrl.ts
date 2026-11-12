import { useEffect, useState } from 'react';
import { buildSearchUrl, readSearchUrl, type SearchUrlState } from './searchUrl';

/** Search state from the URL on the first render. */
export function useInitialSearchUrl(): SearchUrlState {
  const [initial] = useState(() => readSearchUrl(window.location.search));
  return initial;
}

/** Keeps the URL in sync with the search state (null = keep the URL as is). */
export function useSearchUrlSync(state: SearchUrlState | null) {
  const search = state ? buildSearchUrl(state) : null;

  useEffect(() => {
    if (search === null || search === window.location.search) return;
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
  }, [search]);
}
