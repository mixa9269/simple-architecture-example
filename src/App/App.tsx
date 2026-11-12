import { Container, Text, Title } from '@mantine/core';
import { ShowsExplorer } from './ShowsExplorer/ShowsExplorer';
import styles from './styles.module.css';

export function App() {
  return (
    <Container size="md" className={styles.app}>
      <header className={styles.header}>
        <Title order={1} className={styles.title}>
          TV Shows Explorer
        </Title>
        <Text c="dimmed">Find your next binge — powered by TVmaze</Text>
      </header>
      <main>
        <ShowsExplorer />
      </main>
    </Container>
  );
}
