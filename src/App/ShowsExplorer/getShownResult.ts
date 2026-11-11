import type { SearchResult, SearchStatus } from './types';

/**
 * The result to keep on screen.
 * Found shows stay visible while the next query is debounced and loaded;
 * skeletons are shown only when there is nothing to keep (first request, empty or failed answer).
 */
export function getShownResult(
  status: SearchStatus,
  result: SearchResult | null,
): SearchResult | null {
  if (status === 'success') return result;
  if (status !== 'loading' || !result || result.error) return null;
  return result.shows.length > 0 ? result : null;
}
