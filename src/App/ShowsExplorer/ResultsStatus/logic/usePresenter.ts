import { useSelector } from 'react-redux';
import { retrySearch } from '~/App/ShowsExplorer/tasks/retrySearch';
import type { ResultsStatusVariant } from '~/App/ShowsExplorer/ResultsStatus/types';
import {
  selectIsWaitingForServer,
  selectSearchError,
  selectSearchQuery,
  selectSearchRequest,
  selectSearchStatus,
  selectShownAnswer,
} from '~/entities/search/searchSelectors';
import type { SearchStatus } from '~/entities/search/types';
import { formatSummary } from './formatSummary';
import { useIsSlow } from './useIsSlow';

function getVariant(
  status: SearchStatus,
  totalCount: number,
  isSlow: boolean,
): ResultsStatusVariant {
  if (status === 'error') return 'error';
  // A sleeping free-tier server takes up to a minute to answer: say so instead of looking frozen.
  if (isSlow) return 'waking';
  // Shown results keep their summary while the next query loads.
  if (totalCount > 0) return 'summary';
  return status === 'success' ? 'empty' : 'none';
}

export function usePresenter() {
  const status = useSelector(selectSearchStatus);
  const shown = useSelector(selectShownAnswer);
  const error = useSelector(selectSearchError);
  const typed = useSelector(selectSearchQuery).trim();
  const request = useSelector(selectSearchRequest);
  const isSlow = useIsSlow(request, useSelector(selectIsWaitingForServer));
  const result = shown?.result ?? null;
  const totalCount = result?.total ?? 0;
  // The query and genre of the shown results, not of the ones being typed or loaded.
  const query = shown?.request.query ?? typed;

  return {
    variant: getVariant(status, totalCount, isSlow),
    errorMessage: error ?? 'Something went wrong',
    emptyMessage: `Nothing found for “${query}”. Try another title.`,
    summary: formatSummary(totalCount, result?.filteredTotal ?? 0, result?.genre ?? null),
    onRetry: retrySearch,
  };
}
