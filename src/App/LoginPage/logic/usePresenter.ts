import { notifications } from '@mantine/notifications';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { selectIsLoggedIn } from '~/entities/session/sessionSlice';
import { getReturnPath } from './getReturnPath';
import { logIn } from './tasks/logIn';

export function usePresenter() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    const result = await logIn(email);
    setIsPending(false);
    if (result.ok) {
      notifications.show({ color: 'teal', title: 'Logged in', message: result.data.email });
    } else {
      setError(result.error);
    }
  };

  return {
    // Logged in (now or already): leave the page; the store update drives the redirect.
    redirectTo: isLoggedIn ? getReturnPath(location.state) : null,
    email,
    error,
    isPending,
    canSubmit: email.trim() !== '' && !isPending,
    onEmailChange: (event: ChangeEvent<HTMLInputElement>) => setEmail(event.currentTarget.value),
    onSubmit,
  };
}
