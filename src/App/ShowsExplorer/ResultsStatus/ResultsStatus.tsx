import { Alert, Button, Text } from '@mantine/core';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';
import type { Props } from './types';

export function ResultsStatus(props: Props) {
  const { variant, errorMessage, emptyMessage, summary, onRetry } = usePresenter(props);

  if (variant === 'error') {
    return (
      <Alert color="red" variant="light" title="Couldn't load shows" className={styles.alert}>
        <Text size="sm" mb="sm">
          {errorMessage}
        </Text>
        <Button size="xs" color="red" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (variant === 'empty') {
    return (
      <Text className={styles.empty} c="dimmed" aria-live="polite">
        {emptyMessage}
      </Text>
    );
  }

  if (variant === 'waking') {
    return (
      <Text size="sm" c="dimmed" aria-live="polite">
        Waking up the server (free hosting) — the first search can take up to a minute…
      </Text>
    );
  }

  if (variant === 'summary') {
    return (
      <Text size="sm" c="dimmed" aria-live="polite">
        {summary}
      </Text>
    );
  }

  return null;
}
