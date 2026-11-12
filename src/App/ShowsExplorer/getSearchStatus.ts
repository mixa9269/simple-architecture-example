import type { SearchAnswer, SearchRequest, SearchStatus } from './types';

/** Loading until the field is committed as a request and the answer to that request arrives. */
export function getSearchStatus(
  trimmedQuery: string,
  request: SearchRequest | null,
  answer: SearchAnswer | null,
): SearchStatus {
  if (!trimmedQuery) return 'idle';
  if (!request || request.query !== trimmedQuery || !answer || answer.request !== request) {
    return 'loading';
  }
  return answer.error ? 'error' : 'success';
}
