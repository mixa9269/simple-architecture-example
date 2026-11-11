export interface SearchInputProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}
