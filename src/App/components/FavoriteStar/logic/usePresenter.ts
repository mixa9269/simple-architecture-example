import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import type { Props } from '~/App/components/FavoriteStar/types';
import { selectIsFavorite } from '~/entities/favorites/favoritesSlice';
import { selectIsLoggedIn } from '~/entities/session/sessionSlice';
import { getErrorToast, getToggleToast } from './getToggleToast';
import { toggleFavorite } from './tasks/toggleFavorite';

export function usePresenter(props: Props) {
  const { show } = props;
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isFavorite = useSelector(selectIsFavorite(show.id));
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // A guest is sent to the login page and comes back here after logging in.
  const goToLogIn = () => {
    notifications.show({ color: 'yellow', title: 'Log in first', message: 'Log in to add favorites' });
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
  };

  // The task does the work and reports the result; the toast is the UI's reaction, so it lives here.
  const toggle = async () => {
    setIsPending(true);
    const result = await toggleFavorite(show.id);
    setIsPending(false);
    notifications.show(
      result.ok
        ? getToggleToast(result.data.show, result.data.isFavorite)
        : getErrorToast(result.error),
    );
  };

  return {
    isFavorite,
    isPending,
    label: !isLoggedIn
      ? `Log in to add ${show.name} to favorites`
      : isFavorite
        ? `Remove ${show.name} from favorites`
        : `Add ${show.name} to favorites`,
    onToggle: isLoggedIn ? toggle : goToLogIn,
  };
}
