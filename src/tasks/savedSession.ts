// The logged-in email kept between page loads (a helper of the session tasks, not a task).
import { readStored, removeStored, writeStored } from '~/lib/storage';

const KEY = 'tvShowsExplorer.userEmail';

export const readSavedEmail = () => readStored(KEY);
export const saveEmail = (email: string) => writeStored(KEY, email);
export const forgetEmail = () => removeStored(KEY);
