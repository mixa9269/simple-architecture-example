import { Badge, Button, Drawer } from '@mantine/core';
import { FavoritesList } from './FavoritesList/FavoritesList';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function FavoritesButton() {
  const { count, label, opened, onOpen, onClose } = usePresenter();

  return (
    <>
      <Button
        variant="light"
        color="yellow"
        radius="xl"
        aria-label={label}
        leftSection={<span aria-hidden="true">★</span>}
        rightSection={
          <Badge color="yellow" variant="filled" size="sm" circle className={styles.count}>
            {count}
          </Badge>
        }
        onClick={onOpen}
      >
        Favorites
      </Button>

      <Drawer opened={opened} onClose={onClose} position="right" title="Favorites" size="md">
        <FavoritesList />
      </Drawer>
    </>
  );
}
