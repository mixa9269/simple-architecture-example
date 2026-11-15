import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectFavorites } from '~/entities/favorites/favoritesSlice';
import { keepUnstarred } from './keepUnstarred';

export function usePresenter() {
  const current = useSelector(selectFavorites);
  // The Drawer mounts this list on every opening, so this is the list it was opened with.
  const [openedWith] = useState(current);
  const shows = keepUnstarred(openedWith, current);

  return { shows, isEmpty: shows.length === 0 };
}
