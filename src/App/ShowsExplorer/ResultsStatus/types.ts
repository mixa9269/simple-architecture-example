import type { SearchStatus } from '~/App/ShowsExplorer/types';

export interface Props {
  status: SearchStatus;
  /** Query of the shown results */
  query: string;
  error: string | null;
  totalCount: number;
  filteredCount: number;
  selectedGenre: string | null;
  onRetry: () => void;
}

export type ResultsStatusVariant = 'none' | 'error' | 'empty' | 'summary';
