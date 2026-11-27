import type { Show } from '~shared/api';
import { listFavorites } from '~/entities/favorites';

/** The user's favorite shows, newest first — a rule of the answer, so it lives in a task, not in the entity. */
export const listNewestFirst = (email: string): Show[] =>
  listFavorites(email)
    .sort((a, b) => b.order - a.order)
    .map((entry) => entry.show);
