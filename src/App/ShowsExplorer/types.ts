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

/** One search request; a new object per request (Retry makes a new one with the same query). */
export interface SearchRequest {
  query: string;
}

/** The answer to a request: it belongs to the request it references. */
export interface SearchAnswer {
  request: SearchRequest;
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
