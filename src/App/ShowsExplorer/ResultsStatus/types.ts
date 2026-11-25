import type { SearchParams, SearchStatus } from '~/App/ShowsExplorer/types';

export interface Props {
  status: SearchStatus;
  /** Query of the shown results */
  query: string;
  /** Genre the shown results are filtered by */
  genre: string | null;
  error: string | null;
  totalCount: number;
  filteredCount: number;
  /** The params being fetched from the server right now, or null */
  waitingFor: SearchParams | null;
  onRetry: () => void;
}

export type ResultsStatusVariant = 'none' | 'error' | 'waking' | 'empty' | 'summary';
