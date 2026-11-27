import type { Show } from '~shared/api';

/**
 * The list to show while the Drawer is open.
 * A show unstarred in the Drawer keeps its row (with an empty star), so a misclick can be undone;
 * it disappears on the next opening. Shows that appeared after opening come first.
 */
export function keepUnstarred(openedWith: Show[], current: Show[]): Show[] {
  const known = new Set(openedWith.map((show) => show.id));
  return [...current.filter((show) => !known.has(show.id)), ...openedWith];
}
