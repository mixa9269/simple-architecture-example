export interface Props {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}
