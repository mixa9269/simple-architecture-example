const pluralizeShows = (count: number) => `${count} ${count === 1 ? 'show' : 'shows'}`;

export function formatSummary(
  totalCount: number,
  filteredCount: number,
  selectedGenre: string | null,
): string {
  if (!selectedGenre) return `${pluralizeShows(totalCount)} found`;
  return `${filteredCount} of ${pluralizeShows(totalCount)} · ${selectedGenre}`;
}
