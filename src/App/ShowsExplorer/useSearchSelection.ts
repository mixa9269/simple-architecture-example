import { useState } from 'react';
import type { SearchUrlState } from './searchUrl';
import type { SearchAnswer, SearchRequest } from './types';

interface Selection {
  request: SearchRequest | null;
  genre: string | null;
  page: number;
}

/**
 * Selected genre and page of the shown answer, bound to its request object.
 * A new request opens on page 1 with all genres; typing back keeps the request, and the selection.
 * The selection read from the URL is bound to the initial request (the URL query).
 */
export function useSearchSelection(
  shown: SearchAnswer | null,
  initial: Omit<SearchUrlState, 'query'> & { request: SearchRequest | null },
) {
  const [selection, setSelection] = useState<Selection>(initial);

  const isCurrent = shown !== null && shown.request === selection.request;
  const genre = isCurrent ? selection.genre : null;
  const page = isCurrent ? selection.page : 1;

  const update = (patch: Partial<Pick<Selection, 'genre' | 'page'>>) => {
    if (!shown) return;
    setSelection({ request: shown.request, genre, page, ...patch });
  };

  return {
    genre,
    page,
    selectGenre: (next: string | null) => update({ genre: next, page: 1 }),
    setPage: (next: number) => update({ page: next }),
  };
}
