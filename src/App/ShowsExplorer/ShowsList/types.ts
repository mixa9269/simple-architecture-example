import type { Show } from '@/App/ShowsExplorer/types';

export interface ShowsListProps {
  shows: Show[];
  /** Skeletons instead of cards: a query loads and there are no results to keep on screen */
  showSkeleton: boolean;
}
