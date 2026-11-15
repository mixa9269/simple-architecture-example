import { useSelector } from 'react-redux';
import { selectFavorites } from '~/entities/favorites/favoritesSlice';

export function usePresenter() {
  const shows = useSelector(selectFavorites);

  return { shows, isEmpty: shows.length === 0 };
}
