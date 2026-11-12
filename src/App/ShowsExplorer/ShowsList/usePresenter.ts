import { PAGE_SIZE } from '~/App/ShowsExplorer/paginate';
import type { Props } from './types';

const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `skeleton-${index}`);

export function usePresenter(props: Props) {
  const { shows, showSkeleton } = props;

  return {
    shows,
    showSkeleton,
    skeletonKeys: SKELETON_KEYS,
    isHidden: !showSkeleton && shows.length === 0,
  };
}
