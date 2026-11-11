import type { SearchStatus } from '@/App/ShowsExplorer/types';
import { formatSummary } from './formatSummary';
import type { ResultsStatusProps, ResultsStatusVariant } from './types';

function getVariant(status: SearchStatus, totalCount: number): ResultsStatusVariant {
  if (status === 'error') return 'error';
  // Shown results keep their summary while the next query loads.
  if (totalCount > 0) return 'summary';
  return status === 'success' ? 'empty' : 'none';
}

export function usePresenter(props: ResultsStatusProps) {
  const { status, query, error, totalCount, filteredCount, selectedGenre, onRetry } = props;

  return {
    variant: getVariant(status, totalCount),
    errorMessage: error ?? 'Something went wrong',
    emptyMessage: `Nothing found for “${query}”. Try another title.`,
    summary: formatSummary(totalCount, filteredCount, selectedGenre),
    onRetry,
  };
}
