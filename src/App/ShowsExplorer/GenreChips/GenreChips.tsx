import { Chip, Group } from '@mantine/core';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function GenreChips() {
  const { isHidden, items, value, onChange } = usePresenter();

  if (isHidden) return null;

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
