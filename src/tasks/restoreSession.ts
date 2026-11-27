import { sessionStarted } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { success, type TaskResult } from '~/lib/taskResult';
import { readSavedEmail } from './savedSession';

/**
 * Logs the user back in after a reload (called once from main.tsx, before the first render),
 * so the header never flashes "Log in" for a logged-in user.
 */
export const restoreSession = (): TaskResult<string | null> => {
  const email = readSavedEmail();
  if (email) store.dispatch(sessionStarted({ email }));
  return success(email);
};
