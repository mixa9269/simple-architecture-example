import { Stack, Text } from '@mantine/core';
import { FavoriteItem } from './FavoriteItem/FavoriteItem';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function FavoritesList() {
  const { shows, isEmpty } = usePresenter();

  if (isEmpty) {
    return (
      <Text c="dimmed" className={styles.empty}>
        No favorites yet. Tap ☆ on a show to add it here.
      </Text>
    );
  }

  return (
    <Stack gap="sm" component="ul" className={styles.list}>
      {shows.map((show) => (
        <FavoriteItem key={show.id} show={show} />
      ))}
    </Stack>
  );
}
