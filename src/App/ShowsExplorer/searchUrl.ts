import type { SearchStatus } from './types';

/** Search state kept in the URL: ?q=…&genre=…&page=… */
export interface SearchUrlState {
  query: string;
  genre: string | null;
  page: number;
}

export function readSearchUrl(search: string): SearchUrlState {
  const params = new URLSearchParams(search);
  const page = Number(params.get('page'));

  return {
    query: params.get('q')?.trim() ?? '',
    genre: params.get('genre') || null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function buildSearchUrl({ query, genre, page }: SearchUrlState): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (query && genre) params.set('genre', genre);
  if (query && page > 1) params.set('page', String(page));

  const search = params.toString();
  return search ? `?${search}` : '';
}

/**
 * What to write to the URL, or null to keep it as is.
 * While a query loads the URL keeps the last settled state, so a reload restores it.
 */
export function getUrlState(status: SearchStatus, state: SearchUrlState): SearchUrlState | null {
  if (status === 'loading') return null;
  if (status === 'success') return state;
  return { query: state.query, genre: null, page: 1 };
}
