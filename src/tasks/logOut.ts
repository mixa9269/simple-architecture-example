import { favoritesReceived } from '~/entities/favorites/favoritesSlice';
import { sessionEnded } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { forgetEmail } from './savedSession';

/**
 * Logs the user out on this device: forgets the email and drops their favorites from the store.
 * The favorites stay on the server — logging in with the same email brings them back.
 * Also used when the server no longer knows the user (401).
 */
export const logOut = (): TaskResult<null> => {
  forgetEmail();
  store.dispatch(sessionEnded());
  store.dispatch(favoritesReceived([]));
  return success(null);
};
