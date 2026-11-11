import { Anchor, Badge, Card, Group, Image, Text, Title } from '@mantine/core';
import styles from './styles.module.css';
import type { ShowCardProps } from './types';
import { usePresenter } from './usePresenter';

export function ShowCard(props: ShowCardProps) {
  const { name, url, imageUrl, meta, genres, summary } = usePresenter(props);

  return (
    <Card component="article" padding="md" radius="lg" className={styles.card}>
      <Card.Section className={styles.poster}>
        {imageUrl ? (
          <Image src={imageUrl} alt={`${name} poster`} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage}>No poster</div>
        )}
      </Card.Section>

      <Title order={3} size="h4" lineClamp={1} mt="md">
        <Anchor href={url} target="_blank" rel="noreferrer" c="inherit" underline="hover">
          {name}
        </Anchor>
      </Title>

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
