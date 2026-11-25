import type { ShowsQuery } from '~shared/api';

/** What the user asked for: the committed query, the genre (null = all) and the page. */
export type SearchParams = ShowsQuery;

/** What the search shows: nothing typed, waiting (debounce or server), a page, or an error. */
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';
