import type { Props } from '~/App/FavoritesButton/FavoritesList/FavoriteItem/types';

export function usePresenter(props: Props) {
  const { show } = props;

  return {
    show,
    name: show.name,
    url: show.url,
    imageUrl: show.imageUrl,
    meta: [show.year, show.genres.join(', ')].filter(Boolean).join(' · '),
  };
}
