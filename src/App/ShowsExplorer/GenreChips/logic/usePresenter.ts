import { useSelector } from 'react-redux';
import { selectGenre } from '~/App/ShowsExplorer/tasks/selectGenre';
import { selectSelection, selectShownResult } from '~/entities/search/searchSelectors';

const ALL_GENRES = '__all__';
const NO_GENRES: string[] = [];

export function usePresenter() {
  const result = useSelector(selectShownResult);
  const { genre } = useSelector(selectSelection);
  const genres = result?.genres ?? NO_GENRES;

  return {
    isHidden: !result?.total || genres.length === 0,
    items: [
      { value: ALL_GENRES, label: 'All' },
      ...genres.map((item) => ({ value: item, label: item })),
    ],
    value: genre ?? ALL_GENRES,
    onChange: (value: string) => selectGenre(value === ALL_GENRES ? null : value),
  };
}
