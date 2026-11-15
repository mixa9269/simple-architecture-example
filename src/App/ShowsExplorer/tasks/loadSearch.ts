import type { ShowsPage } from '~shared/api';
import { api } from '~/api/api';
import { answerReceived, requestStarted } from '~/entities/search/searchSlice';
import type { SearchRequest } from '~/entities/search/types';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';

/** The load in progress: a new load or a cleared search cancels it. */
let current: AbortController | null = null;

/** Cancels the load in progress, if any. */
export const abortSearch = () => {
  current?.abort();
  current = null;
};

/**
 * Loads one search request into the store (inner task of the search tasks).
 * The answer is stored with the request it belongs to; a cancelled load stores nothing.
 */
export const loadSearch = async (request: SearchRequest): Promise<TaskResult<ShowsPage>> => {
  abortSearch();
  const controller = new AbortController();
  current = controller;
  store.dispatch(requestStarted(request));

  try {
    const result = await api.shows.search(request, controller.signal);
    if (!controller.signal.aborted) {
      store.dispatch(answerReceived({ request, result, error: null }));
    }
    return success(result);
  } catch (error) {
    const answer = failure(error, controller.signal);
    if (!controller.signal.aborted && !answer.ok) {
      store.dispatch(answerReceived({ request, result: null, error: answer.error }));
    }
    return answer;
  }
};
