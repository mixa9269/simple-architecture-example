import { useState } from 'react';
import type { SearchResult } from './types';
import { FIRST_RESULT_ID } from './useShowsSearch';
import type { SearchUrlState } from './searchUrl';

interface Selection {
  resultId: number;
  query: string;
  genre: string | null;
  page: number;
}

/**
 * Selected genre and page of the shown result.
 * A selection belongs to one answer: a new answer opens on page 1 with all genres,
 * while typing (and typing back) keeps the selection on screen.
 * The selection read from the URL applies to the first answer for the URL query.
 */
export function useSearchSelection(shown: SearchResult | null, initial: SearchUrlState) {
  const [selection, setSelection] = useState<Selection>(() => ({
    resultId: FIRST_RESULT_ID,
    query: initial.query,
    genre: initial.genre,
    page: initial.page,
  }));

  const isCurrent =
    shown !== null && selection.resultId === shown.id && selection.query === shown.query;
  const genre = isCurrent ? selection.genre : null;
  const page = isCurrent ? selection.page : 1;

  const update = (patch: Partial<Pick<Selection, 'genre' | 'page'>>) => {
    if (!shown) return;
    setSelection({ resultId: shown.id, query: shown.query, genre, page, ...patch });
  };

  return {
    genre,
    page,
    selectGenre: (next: string | null) => update({ genre: next, page: 1 }),
    setPage: (next: number) => update({ page: next }),
  };
}
