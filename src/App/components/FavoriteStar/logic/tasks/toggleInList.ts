import type { Show } from '~shared/api';

/** The list with the show toggled: removed if it is there, otherwise put first (newest first). */
export const toggleInList = (shows: Show[], show: Show): Show[] =>
  shows.some(({ id }) => id === show.id)
    ? shows.filter(({ id }) => id !== show.id)
    : [show, ...shows];
