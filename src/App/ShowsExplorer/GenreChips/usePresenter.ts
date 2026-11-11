import type { GenreChipsProps } from './types';

const ALL_GENRES = '__all__';

export function usePresenter(props: GenreChipsProps) {
  const { genres, selectedGenre, onChange } = props;

  return {
    items: [
      { value: ALL_GENRES, label: 'All' },
      ...genres.map((genre) => ({ value: genre, label: genre })),
    ],
    value: selectedGenre ?? ALL_GENRES,
    onChange: (value: string) => onChange(value === ALL_GENRES ? null : value),
  };
}
