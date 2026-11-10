import { Container, Text, Title } from '@mantine/core';
import { ShowsExplorer } from './ShowsExplorer/ShowsExplorer';
import styles from './styles.module.css';
import { usePresenter } from './usePresenter';

export function App() {
  const { title, subtitle } = usePresenter();

  return (
    <Container size="md" className={styles.app}>
      <header className={styles.header}>
        <Title order={1} className={styles.title}>
          {title}
        </Title>
        <Text c="dimmed">{subtitle}</Text>
      </header>
      <main>
        <ShowsExplorer />
      </main>
    </Container>
  );
}
