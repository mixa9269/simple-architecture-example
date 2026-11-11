export interface Show {
  id: number;
  name: string;
  genres: string[];
  imageUrl: string | null;
  year: string | null;
  rating: number | null;
  summary: string;
  url: string;
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchResult {
  /** Unique per received answer, starting at FIRST_RESULT_ID */
  id: number;
  /** `${query}#${retryCount}` of the request that produced this result */
  key: string;
  query: string;
  shows: Show[];
  error: string | null;
}

/** Raw show object returned by https://api.tvmaze.com/search/shows */
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

export interface TvmazeSearchItem {
  score: number;
  show: TvmazeShow;
}
