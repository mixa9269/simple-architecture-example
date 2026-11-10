import { Card, Skeleton } from '@mantine/core';
import styles from './styles.module.css';
import { usePresenter } from './usePresenter';

export function ShowCardSkeleton() {
  const { lines } = usePresenter();

  return (
    <Card padding="md" radius="lg" className={styles.card} aria-hidden="true">
      <Card.Section>
        <Skeleton className={styles.poster} radius={0} />
      </Card.Section>
      {lines.map((line) => (
        <Skeleton key={line.key} height={line.height} width={line.width} mt="sm" radius="xl" />
      ))}
    </Card>
  );
}
