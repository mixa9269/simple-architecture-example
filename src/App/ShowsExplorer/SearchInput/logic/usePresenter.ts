import { useRef, type ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import { typeQuery } from '~/App/ShowsExplorer/tasks/typeQuery';
import { selectSearchQuery, selectSearchStatus } from '~/entities/search/searchSelectors';

export function usePresenter() {
  const value = useSelector(selectSearchQuery);
  const isLoading = useSelector(selectSearchStatus) === 'loading';
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    inputRef,
    value,
    isLoading,
    showClear: !isLoading && value.length > 0,
    onChange: (event: ChangeEvent<HTMLInputElement>) => typeQuery(event.currentTarget.value),
    // The clear button disappears on click, so give the focus back to the field.
    onClear: () => {
      typeQuery('');
      inputRef.current?.focus();
    },
  };
}
