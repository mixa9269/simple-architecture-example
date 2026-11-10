import type { SearchResult, SearchStatus } from './types';

export function getSearchStatus(
  query: string,
  debouncedQuery: string,
  requestKey: string,
  result: SearchResult | null,
): SearchStatus {
  if (!query) return 'idle';
  if (query !== debouncedQuery || !result || result.key !== requestKey) return 'loading';
  return result.error ? 'error' : 'success';
}
