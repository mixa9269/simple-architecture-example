import type { SearchAnswer, SearchStatus } from './types';

/**
 * The answer to keep on screen.
 * Found shows stay visible while the next query is debounced and loaded;
 * skeletons are shown only when there is nothing to keep (first request, empty or failed answer).
 */
export function getShownAnswer(
  status: SearchStatus,
  answer: SearchAnswer | null,
): SearchAnswer | null {
  if (status === 'success') return answer;
  if (status !== 'loading' || !answer || answer.error) return null;
  return answer.shows.length > 0 ? answer : null;
}
