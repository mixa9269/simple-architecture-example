import { PAGE_SIZE } from '../paginate';
import type { Show } from '../types';

export interface ShowsListProps {
  shows: Show[];
  isLoading: boolean;
}

const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `skeleton-${index}`);

export function usePresenter({ shows, isLoading }: ShowsListProps) {
  return {
    shows,
    isLoading,
    skeletonKeys: SKELETON_KEYS,
    isHidden: !isLoading && shows.length === 0,
  };
}
