import { useSelector } from 'react-redux';
import { selectPage } from '~/App/ShowsExplorer/tasks/selectPage';
import { selectSelection, selectShownResult } from '~/entities/search/searchSelectors';

export function usePresenter() {
  const result = useSelector(selectShownResult);
  const { page } = useSelector(selectSelection);
  const totalPages = result?.totalPages ?? 1;

  return {
    isHidden: !result?.total || totalPages < 2,
    page,
    totalPages,
    onChange: selectPage,
  };
}
