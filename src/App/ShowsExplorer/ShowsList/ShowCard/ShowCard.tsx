import { Anchor, Badge, Card, Group, Image, Text, Title } from '@mantine/core';
import { FavoriteStar } from '~/App/components/FavoriteStar/FavoriteStar';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';
import type { Props } from './types';

export function ShowCard(props: Props) {
  const { show, name, url, imageUrl, meta, genres, summary } = usePresenter(props);

  return (
    <Card component="article" padding="md" radius="lg" className={styles.card}>
      <Card.Section className={styles.poster}>
        {imageUrl ? (
          <Image src={imageUrl} alt={`${name} poster`} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage}>No poster</div>
        )}
      </Card.Section>

      <Group justify="space-between" wrap="nowrap" gap="xs" mt="md">
        <Title order={3} size="h4" lineClamp={1}>
          <Anchor href={url} target="_blank" rel="noreferrer" c="inherit" underline="hover">
            {name}
          </Anchor>
        </Title>
        <FavoriteStar show={show} />
      </Group>

      {meta && (
        <Text size="sm" c="dimmed" mt={4}>
          {meta}
        </Text>
      )}

      {genres.length > 0 && (
        <Group gap={6} mt="sm">
          {genres.map((genre) => (
            <Badge key={genre} variant="light" size="sm">
              {genre}
            </Badge>
          ))}
        </Group>
      )}

      {summary && (
        <Text size="sm" c="dimmed" lineClamp={3} mt="sm">
          {summary}
        </Text>
      )}
    </Card>
  );
}
