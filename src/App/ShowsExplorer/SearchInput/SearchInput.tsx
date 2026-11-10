import { CloseButton, TextInput } from '@mantine/core';
import styles from './styles.module.css';
import { usePresenter, type SearchInputProps } from './usePresenter';

export function SearchInput(props: SearchInputProps) {
  const { value, isLoading, showClear, onChange, onClear } = usePresenter(props);

  return (
    <TextInput
      classNames={{ input: styles.input }}
      size="lg"
      radius="xl"
      value={value}
      onChange={onChange}
      placeholder="Search TV shows, e.g. Murder"
      aria-label="Search TV shows"
      autoFocus
      loading={isLoading}
      leftSection={
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      }
      rightSection={
        showClear ? <CloseButton aria-label="Clear search" onClick={onClear} /> : undefined
      }
    />
  );
}
