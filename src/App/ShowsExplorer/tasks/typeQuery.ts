import { queryChanged, searchCleared } from '~/entities/search/searchSlice';
import { store } from '~/entities/store';
import { debounce } from '~/lib/debounce';
import { success, type TaskResult } from '~/lib/taskResult';
import { abortSearch } from './loadSearch';
import { searchShows } from './searchShows';

export const SEARCH_DEBOUNCE_MS = 400;

const searchLater = debounce(searchShows, SEARCH_DEBOUNCE_MS);

/**
 * The user types into the search field.
 * The text is stored at once; the search starts when typing stops.
 * An emptied field drops the search at once: the next query loads with skeletons, not old shows.
 */
export const typeQuery = (value: string): TaskResult<null> => {
  store.dispatch(queryChanged(value));
  const trimmed = value.trim();

  if (trimmed) {
    searchLater(trimmed);
  } else {
    searchLater.cancel();
    abortSearch();
    store.dispatch(searchCleared());
  }
  return success(null);
};
