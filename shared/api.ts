// API contract between the frontend (src/) and the backend (server/).
// Types only: both sides import it with `import type`, so nothing resolves it at runtime.

/** A TV show as the app shows it (mapped from TVmaze on the server). */
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

/** Input of GET /api/shows: ?q=&genre=&page= */
export interface ShowsQuery {
  query: string;
  /** null = all genres */
  genre: string | null;
  /** 1-based */
  page: number;
}

/** GET /api/shows?q=&genre=&page= — one page of the search results. */
export interface ShowsPage {
  query: string;
  /** The applied genre: null when no genre was asked for or it is missing from the results. */
  genre: string | null;
  /** The applied page, clamped to 1…totalPages. */
  page: number;
  totalPages: number;
  /** Shows found for the query. */
  total: number;
  /** Shows left after the genre filter. */
  filteredTotal: number;
  /** All genres of the found shows, sorted. */
  genres: string[];
  shows: Show[];
}

/** GET /api/favorites — newest first. */
export interface FavoritesAnswer {
  shows: Show[];
}

/** POST /api/favorites/:id/toggle */
export interface ToggleFavoriteAnswer {
  show: Show;
  isFavorite: boolean;
  /** The whole list after the toggle, newest first. */
  favorites: Show[];
}

/** A logged-in user; the email is the identity (sent as `X-User-Email`). */
export interface User {
  email: string;
}

/** POST /api/login */
export interface LoginRequest {
  email: string;
}

/** Answer of POST /api/login: the normalized email. */
export interface LoginAnswer {
  user: User;
}

/** Body of any non-2xx answer. */
export interface ApiError {
  error: string;
}
