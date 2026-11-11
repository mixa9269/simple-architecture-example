import { PAGE_SIZE } from '@/App/ShowsExplorer/paginate';
import type { ShowsListProps } from './types';

const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `skeleton-${index}`);

export function usePresenter(props: ShowsListProps) {
  const { shows, showSkeleton } = props;

  return {
    shows,
    showSkeleton,
    skeletonKeys: SKELETON_KEYS,
    isHidden: !showSkeleton && shows.length === 0,
  };
}
