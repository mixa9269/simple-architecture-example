import type { ChangeEvent } from 'react';

export interface SearchInputProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function usePresenter({ value, isLoading, onChange, onClear }: SearchInputProps) {
  return {
    value,
    isLoading,
    showClear: !isLoading && value.length > 0,
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
    onClear,
  };
}
