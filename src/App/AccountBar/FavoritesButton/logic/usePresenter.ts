import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFavoritesCount } from '~/entities/favorites/favoritesSlice';
import { loadFavorites } from './tasks/loadFavorites';

export function usePresenter() {
  const [opened, { open, close }] = useDisclosure(false);
  const count = useSelector(selectFavoritesCount);

  useEffect(() => {
    const controller = new AbortController();
    loadFavorites(controller.signal).then((result) => {
      if (result.ok || controller.signal.aborted) return;
      notifications.show({ color: 'red', title: 'Could not load favorites', message: result.error });
    });
    return () => controller.abort();
  }, []);

  return {
    count,
    label: `Favorites: ${count} ${count === 1 ? 'show' : 'shows'}`,
    opened,
    onOpen: open,
    onClose: close,
  };
}
