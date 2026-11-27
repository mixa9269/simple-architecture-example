import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { buildSearchUrl, type SearchUrlState } from './searchUrl';

/**
 * Keeps the URL (through the router) in sync with the settled search; null = keep the URL as is.
 * The initial state is read from the URL on the first render, so there is nothing to restore here.
 */
export function useSearchUrl(state: SearchUrlState | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const next = state ? buildSearchUrl(state).replace(/^\?/, '') : null;
  const current = searchParams.toString();

  useEffect(() => {
    if (next === null || next === current) return;
    setSearchParams(new URLSearchParams(next), { replace: true });
  }, [next, current, setSearchParams]);
}
