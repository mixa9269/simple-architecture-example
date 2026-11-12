import { useRef, type ChangeEvent } from 'react';
import type { Props } from './types';

export function usePresenter(props: Props) {
  const { value, isLoading, onChange, onClear } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    inputRef,
    value,
    isLoading,
    showClear: !isLoading && value.length > 0,
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
    // The clear button disappears on click, so give the focus back to the field.
    onClear: () => {
      onClear();
      inputRef.current?.focus();
    },
  };
}
