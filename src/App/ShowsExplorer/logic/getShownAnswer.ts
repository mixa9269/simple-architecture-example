import type { SearchAnswer, SearchStatus } from '~/App/ShowsExplorer/types';

/**
 * The answer to keep on screen.
 * Found shows stay visible while the next query, genre or page is loaded;
 * skeletons are shown only when there is nothing to keep (first request, empty or failed answer).
 */
export function getShownAnswer(
  status: SearchStatus,
  answer: SearchAnswer | null,
): SearchAnswer | null {
  if (status === 'success') return answer;
  if (status !== 'loading' || !answer?.result) return null;
  return answer.result.total > 0 ? answer : null;
}
