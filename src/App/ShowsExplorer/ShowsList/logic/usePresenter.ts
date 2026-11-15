import type { Props } from '~/App/ShowsExplorer/ShowsList/types';

/** As many skeletons as cards on a page (the page size itself is the server's business). */
const SKELETON_COUNT = 3;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`);

export function usePresenter(props: Props) {
  const { shows, showSkeleton } = props;

  return {
    shows,
    showSkeleton,
    skeletonKeys: SKELETON_KEYS,
    isHidden: !showSkeleton && shows.length === 0,
  };
}
