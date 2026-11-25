/** Raw show object returned by the TVmaze API (https://www.tvmaze.com/api) */
export interface TvmazeShow {
  id: number;
  name: string;
  genres: string[] | null;
  image: { medium: string; original: string } | null;
  premiered: string | null;
  rating: { average: number | null } | null;
  summary: string | null;
  url: string;
}

/** An item of GET /search/shows */
export interface TvmazeSearchItem {
  score: number;
  show: TvmazeShow;
}
