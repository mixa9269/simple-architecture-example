import type { User } from '~shared/api';
import { api } from '~/api/api';
import { sessionStarted } from '~/entities/session/sessionSlice';
import { store } from '~/entities/store';
import { failure, success, type TaskResult } from '~/lib/taskResult';
import { saveEmail } from '~/tasks/savedSession';

/**
 * Logs the user in with just an email; the server checks it and returns it normalized.
 * The session survives a reload (the email is saved on this device).
 */
export const logIn = async (email: string): Promise<TaskResult<User>> => {
  try {
    const { user } = await api.auth.login(email);
    saveEmail(user.email);
    store.dispatch(sessionStarted(user.email));
    return success(user);
  } catch (error) {
    return failure(error);
  }
};
