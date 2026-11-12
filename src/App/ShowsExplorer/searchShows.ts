import { mapShow } from './mapShow';
import type { Show, TvmazeSearchItem } from './types';

const SEARCH_URL = 'https://api.tvmaze.com/search/shows';

export async function searchShows(query: string, signal: AbortSignal): Promise<Show[]> {
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) {
    throw new Error(`TVmaze responded with status ${response.status}`);
  }
  const items: TvmazeSearchItem[] = await response.json();
  return items.map((item) => mapShow(item.show));
}
