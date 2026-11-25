import { useEffect } from 'react';
import { buildSearchUrl, type SearchUrlState } from './searchUrl';

/**
 * Keeps the URL in sync with the settled search (null = keep the URL as is).
 * The initial state is read from the URL on the first render, so there is nothing to restore here.
 */
export function useSearchUrl(state: SearchUrlState | null) {
  const search = state ? buildSearchUrl(state) : null;

  useEffect(() => {
    if (search === null || search === window.location.search) return;
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
  }, [search]);
}
