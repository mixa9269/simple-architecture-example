import type { Show } from '~shared/api';
import { stripHtml } from './stripHtml';
import type { TvmazeShow } from './types';

export const mapShow = (raw: TvmazeShow): Show => ({
  id: raw.id,
  name: raw.name,
  genres: raw.genres ?? [],
  imageUrl: raw.image?.medium ?? null,
  year: raw.premiered?.slice(0, 4) ?? null,
  rating: raw.rating?.average ?? null,
  summary: stripHtml(raw.summary),
  url: raw.url,
});
