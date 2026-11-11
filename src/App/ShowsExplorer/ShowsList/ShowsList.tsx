import { ShowCard } from './ShowCard/ShowCard';
import { ShowCardSkeleton } from './ShowCardSkeleton/ShowCardSkeleton';
import styles from './styles.module.css';
import type { ShowsListProps } from './types';
import { usePresenter } from './usePresenter';

export function ShowsList(props: ShowsListProps) {
  const { shows, skeletonKeys, showSkeleton, isHidden } = usePresenter(props);

  if (isHidden) return null;

  return (
    <div className={styles.grid} aria-busy={showSkeleton}>
      {showSkeleton
        ? skeletonKeys.map((key) => <ShowCardSkeleton key={key} />)
        : shows.map((show) => <ShowCard key={show.id} show={show} />)}
    </div>
  );
}
