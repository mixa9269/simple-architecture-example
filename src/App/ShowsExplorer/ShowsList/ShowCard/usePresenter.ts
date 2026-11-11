import type { ShowCardProps } from './types';

function formatMeta(year: string | null, rating: number | null): string {
  const parts = [year, rating !== null ? `★ ${rating.toFixed(1)}` : null];
  return parts.filter(Boolean).join(' · ');
}

export function usePresenter(props: ShowCardProps) {
  const { show } = props;

  return {
    name: show.name,
    url: show.url,
    imageUrl: show.imageUrl,
    meta: formatMeta(show.year, show.rating),
    genres: show.genres,
    summary: show.summary,
  };
}
