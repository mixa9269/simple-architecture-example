import { useSelector } from 'react-redux';
import type { Show } from '~shared/api';
import { selectSearchStatus, selectShownResult } from '~/entities/search/searchSelectors';

/** As many skeletons as cards on a page (the page size itself is the server's business). */
const SKELETON_COUNT = 3;
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`);
const NO_SHOWS: Show[] = [];

export function usePresenter() {
  const shows = useSelector(selectShownResult)?.shows ?? NO_SHOWS;
  // Skeletons only when a search loads and there are no results to keep on screen.
  const showSkeleton = useSelector(selectSearchStatus) === 'loading' && shows.length === 0;

  return {
    shows,
    showSkeleton,
    skeletonKeys: SKELETON_KEYS,
    isHidden: !showSkeleton && shows.length === 0,
  };
}
