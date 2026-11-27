import { Anchor, Group, Image, Text } from '@mantine/core';
import { FavoriteStar } from '~/App/components/FavoriteStar/FavoriteStar';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';
import type { Props } from './types';

export function FavoriteItem(props: Props) {
  const { show, name, url, imageUrl, meta } = usePresenter(props);

  return (
    <Group component="li" wrap="nowrap" gap="sm" className={styles.item}>
      {imageUrl ? (
        <Image src={imageUrl} alt={`${name} poster`} className={styles.thumb} loading="lazy" />
      ) : (
        <div className={styles.thumb} aria-hidden="true" />
      )}

      <div className={styles.text}>
        <Anchor href={url} target="_blank" rel="noreferrer" c="inherit" fw={600} lineClamp={1}>
          {name}
        </Anchor>
        {meta && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {meta}
          </Text>
        )}
      </div>

      <FavoriteStar show={show} />
    </Group>
  );
}
