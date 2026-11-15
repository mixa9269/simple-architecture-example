import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { Props } from '~/App/components/FavoriteStar/types';
import { selectIsFavorite } from '~/entities/favorites/favoritesSlice';
import { getErrorToast, getToggleToast } from './getToggleToast';
import { toggleFavorite } from './tasks/toggleFavorite';

export function usePresenter(props: Props) {
  const { show } = props;
  const isFavorite = useSelector(selectIsFavorite(show.id));
  const [isPending, setIsPending] = useState(false);

  // The task does the work and reports the result; the toast is the UI's reaction, so it lives here.
  const onToggle = async () => {
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
    label: isFavorite ? `Remove ${show.name} from favorites` : `Add ${show.name} to favorites`,
    onToggle,
  };
}
