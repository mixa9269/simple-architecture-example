import { auth } from './auth';
import { favorites } from './favorites';
import { shows } from './shows';

/**
 * Our backend, grouped by domain: `await api.favorites.toggle(id)`.
 * Only tasks call it (see .claude/rules/sa-api-layer.md).
 */
export const api = { auth, shows, favorites };

/** A non-2xx answer (`status` + the server's message); tasks may branch on it, e.g. 401. */
export { HttpError } from './callApi';
