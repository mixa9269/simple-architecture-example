import { Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Navigate } from 'react-router';
import { usePresenter } from './logic/usePresenter';
import styles from './styles.module.css';

export function LoginPage() {
  const { redirectTo, email, error, isPending, canSubmit, onEmailChange, onSubmit } =
    usePresenter();

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <Paper component="form" radius="lg" p="xl" className={styles.card} onSubmit={onSubmit}>
      <Stack gap="md">
        <Title order={2} size="h3">
          Log in
        </Title>
        <Text size="sm" c="dimmed">
          No password — favorites are saved to your email.
        </Text>
        <TextInput
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={onEmailChange}
          error={error}
        />
        <Button type="submit" radius="xl" loading={isPending} disabled={!canSubmit}>
          Log in
        </Button>
      </Stack>
    </Paper>
  );
}
