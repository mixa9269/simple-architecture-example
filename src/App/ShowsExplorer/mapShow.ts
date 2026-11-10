import type { Show, TvmazeShow } from './types';

export function stripHtml(html: string | null): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').trim();
}

export function mapShow(raw: TvmazeShow): Show {
  return {
    id: raw.id,
    name: raw.name,
    genres: raw.genres ?? [],
    imageUrl: raw.image?.medium ?? null,
    year: raw.premiered?.slice(0, 4) ?? null,
    rating: raw.rating?.average ?? null,
    summary: stripHtml(raw.summary),
    url: raw.url,
  };
}
