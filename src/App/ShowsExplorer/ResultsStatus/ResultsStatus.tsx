import { Alert, Button, Text } from '@mantine/core';
import styles from './styles.module.css';
import { usePresenter, type ResultsStatusProps } from './usePresenter';

export function ResultsStatus(props: ResultsStatusProps) {
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

  if (variant === 'summary') {
    return (
      <Text size="sm" c="dimmed" aria-live="polite">
        {summary}
      </Text>
    );
  }

  return null;
}
