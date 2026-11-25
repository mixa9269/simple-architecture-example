import type { SearchRequest, SearchStatus, ShowsPage } from './types';

/**
 * Genre and page for the chips and the pagination.
 * While loading, the asked ones (the controls respond at once); after that, the ones the server applied
 * (it drops a genre missing from the results and clamps the page).
 */
export function getSelection(
  status: SearchStatus,
  request: SearchRequest | null,
  result: ShowsPage | null,
) {
  if (status === 'loading' && request) return { genre: request.genre, page: request.page };
  return { genre: result?.genre ?? null, page: result?.page ?? 1 };
}
