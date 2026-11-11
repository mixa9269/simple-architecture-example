export interface GenreChipsProps {
  genres: string[];
  selectedGenre: string | null;
  onChange: (genre: string | null) => void;
}
