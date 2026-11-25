import { favorites } from './favorites';
import { shows } from './shows';

/**
 * Our backend, grouped by domain: `await api.favorites.toggle(id)`.
 * Only tasks call it (see .claude/rules/sa-api-layer.md).
 */
export const api = { shows, favorites };
