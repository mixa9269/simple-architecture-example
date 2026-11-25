import type { Props, ResultsStatusVariant } from '~/App/ShowsExplorer/ResultsStatus/types';
import type { SearchStatus } from '~/App/ShowsExplorer/types';
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

export function usePresenter(props: Props) {
  const { status, query, genre, error, totalCount, filteredCount, waitingFor, onRetry } = props;
  const isSlow = useIsSlow(waitingFor, waitingFor !== null);

  return {
    variant: getVariant(status, totalCount, isSlow),
    errorMessage: error ?? 'Something went wrong',
    emptyMessage: `Nothing found for “${query}”. Try another title.`,
    summary: formatSummary(totalCount, filteredCount, genre),
    onRetry,
  };
}
