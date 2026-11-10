export interface GenreChipsProps {
  genres: string[];
  selectedGenre: string | null;
  onChange: (genre: string | null) => void;
}

const ALL_GENRES = '__all__';

export function usePresenter({ genres, selectedGenre, onChange }: GenreChipsProps) {
  return {
    items: [
      { value: ALL_GENRES, label: 'All' },
      ...genres.map((genre) => ({ value: genre, label: genre })),
    ],
    value: selectedGenre ?? ALL_GENRES,
    onChange: (value: string) => onChange(value === ALL_GENRES ? null : value),
  };
}
