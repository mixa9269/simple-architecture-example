import type { SearchStatus } from '../types';
import { formatSummary } from './formatSummary';

export interface ResultsStatusProps {
  status: SearchStatus;
  query: string;
  error: string | null;
  totalCount: number;
  filteredCount: number;
  selectedGenre: string | null;
  onRetry: () => void;
}

type Variant = 'none' | 'error' | 'empty' | 'summary';

function getVariant(status: SearchStatus, totalCount: number): Variant {
  if (status === 'error') return 'error';
  if (status !== 'success') return 'none';
  return totalCount === 0 ? 'empty' : 'summary';
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
