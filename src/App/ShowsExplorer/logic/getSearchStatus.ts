import type { SearchParams, SearchStatus } from '~/App/ShowsExplorer/types';

interface SearchState {
  /** The field, as typed. */
  query: string;
  /** What was asked last. */
  params: SearchParams | null;
  isFetching: boolean;
  error: string | null;
}

/**
 * Loading from the first keystroke until the answer arrives (debounce pending or fetching),
 * so the indicator doesn't flicker between typing and the request.
 */
export function getSearchStatus({ query, params, isFetching, error }: SearchState): SearchStatus {
  const typed = query.trim();
  if (!typed) return 'idle';
  if (isFetching || typed !== params?.query) return 'loading';
  return error ? 'error' : 'success';
}
