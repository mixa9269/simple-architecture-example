import { Container, Text, Title } from '@mantine/core';
import { Navigate, Route, Routes } from 'react-router';
import { AccountBar } from './AccountBar/AccountBar';
import { LoginPage } from './LoginPage/LoginPage';
import { ShowsExplorer } from './ShowsExplorer/ShowsExplorer';
import styles from './styles.module.css';

export function App() {
  return (
    <Container size="md" className={styles.app}>
      <AccountBar />
      <header className={styles.header}>
        <Title order={1} className={styles.title}>
          TV Shows Explorer
        </Title>
        <Text c="dimmed">Find your next binge — powered by TVmaze</Text>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ShowsExplorer />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Container>
  );
}
