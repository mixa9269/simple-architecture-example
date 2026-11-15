import type { ShowsPage, ShowsQuery } from '~shared/api';

export type { Show, ShowsPage } from '~shared/api';

/** What the search shows: nothing typed, waiting (debounce or server), a page, or an error. */
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * One search request; a new object per request (kept by reference in the store).
 * Typing makes a new one after the debounce, a genre or page makes one at once, Retry copies it.
 */
export type SearchRequest = ShowsQuery;

/** The answer to a request: it belongs to the request it references. */
export interface SearchAnswer {
  request: SearchRequest;
  /** The page from the server; null when the request failed. */
  result: ShowsPage | null;
  error: string | null;
}
