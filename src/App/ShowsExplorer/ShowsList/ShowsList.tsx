import { ShowCard } from './ShowCard/ShowCard';
import { ShowCardSkeleton } from './ShowCardSkeleton/ShowCardSkeleton';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function ShowsList() {
  const { shows, skeletonKeys, showSkeleton, isHidden } = usePresenter();

  if (isHidden) return null;

  return (
    <div className={styles.grid} aria-busy={showSkeleton}>
      {showSkeleton
        ? skeletonKeys.map((key) => <ShowCardSkeleton key={key} />)
        : shows.map((show) => <ShowCard key={show.id} show={show} />)}
    </div>
  );
}
