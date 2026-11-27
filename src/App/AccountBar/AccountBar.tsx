import { Button, Group, Text } from '@mantine/core';
import { FavoritesButton } from './FavoritesButton/FavoritesButton';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function AccountBar() {
  const { email, showLogIn, onLogIn, onLogOut } = usePresenter();

  if (email === null) {
    return (
      <Group justify="flex-end" className={styles.bar}>
        {showLogIn && (
          <Button variant="light" radius="xl" onClick={onLogIn}>
            Log in
          </Button>
        )}
      </Group>
    );
  }

  return (
    <Group justify="flex-end" gap="sm" className={styles.bar}>
      <Text size="sm" c="dimmed" className={styles.email}>
        {email}
      </Text>
      <FavoritesButton />
      <Button variant="subtle" color="gray" radius="xl" onClick={onLogOut}>
        Log out
      </Button>
    </Group>
  );
}
