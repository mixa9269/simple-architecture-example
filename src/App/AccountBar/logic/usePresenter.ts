import { notifications } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { selectUserEmail } from '~/entities/session/sessionSlice';
import { logOut } from '~/tasks/logOut';

export function usePresenter() {
  const email = useSelector(selectUserEmail);
  const navigate = useNavigate();
  const location = useLocation();

  return {
    email,
    // No "Log in" button on the login page itself.
    showLogIn: email === null && location.pathname !== '/login',
    // After login the user comes back here (see LoginPage).
    onLogIn: () =>
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } }),
    onLogOut: () => {
      logOut();
      notifications.show({ color: 'gray', title: 'Logged out', message: `See you, ${email}` });
    },
  };
}
