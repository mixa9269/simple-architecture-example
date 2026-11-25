import type { Show } from '~shared/api';

/** The toast shown after a show was added to favorites or removed from there. */
export function getToggleToast(show: Show, isFavorite: boolean) {
  return isFavorite
    ? { color: 'yellow', title: 'Added to favorites', message: `“${show.name}” is in your favorites now` }
    : { color: 'gray', title: 'Removed from favorites', message: `“${show.name}” is no longer in your favorites` };
}

export function getErrorToast(message: string) {
  return { color: 'red', title: 'Could not update favorites', message };
}
