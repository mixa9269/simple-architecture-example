export interface Props {
  genres: string[];
  selectedGenre: string | null;
  onChange: (genre: string | null) => void;
}
