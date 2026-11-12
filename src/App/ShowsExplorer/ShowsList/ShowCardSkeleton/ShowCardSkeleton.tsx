import { Card, Skeleton } from '@mantine/core';
import styles from './styles.module.css';

// Title, meta and three summary lines.
const LINES = [
  { key: 'title', width: '70%', height: 20 },
  { key: 'meta', width: '35%', height: 12 },
  { key: 'summary-1', width: '100%', height: 12 },
  { key: 'summary-2', width: '95%', height: 12 },
  { key: 'summary-3', width: '60%', height: 12 },
];

export function ShowCardSkeleton() {
  return (
    <Card padding="md" radius="lg" className={styles.card} aria-hidden="true">
      <Card.Section>
        <Skeleton className={styles.poster} radius={0} />
      </Card.Section>
      {LINES.map((line) => (
        <Skeleton key={line.key} height={line.height} width={line.width} mt="sm" radius="xl" />
      ))}
    </Card>
  );
}
