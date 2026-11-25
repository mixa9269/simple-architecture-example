import type { Show } from '~shared/api';

export interface Props {
  shows: Show[];
  /** Skeletons instead of cards: a search loads and there are no results to keep on screen */
  showSkeleton: boolean;
}
