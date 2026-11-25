import { Chip, Group } from '@mantine/core';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';
import type { Props } from './types';

export function GenreChips(props: Props) {
  const { items, value, onChange } = usePresenter(props);

  return (
    <Chip.Group multiple={false} value={value} onChange={onChange}>
      <Group gap="xs" className={styles.chips} role="group" aria-label="Filter by genre">
        {items.map((item) => (
          <Chip key={item.value} value={item.value} variant="light" size="sm" radius="xl">
            {item.label}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
  );
}
