import { ActionIcon } from '@mantine/core';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';
import type { Props } from './types';

export function FavoriteStar(props: Props) {
  const { isFavorite, isPending, label, onToggle } = usePresenter(props);

  return (
    <ActionIcon
      variant="subtle"
      color="yellow"
      size="lg"
      radius="xl"
      aria-label={label}
      aria-pressed={isFavorite}
      aria-busy={isPending}
      onClick={onToggle}
    >
      <svg className={isFavorite ? styles.filled : styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
      </svg>
    </ActionIcon>
  );
}
