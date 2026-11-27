import { Router } from 'express';
import { getFavorites } from '~/tasks/getFavorites';
import { toggleFavorite } from '~/tasks/toggleFavorite';
import { parseShowId } from './parseShowsQuery';
import { parseUserEmail } from './parseUserEmail';
import { sendResult } from './sendResult';

export const favoritesRoutes = Router();

// GET /api/favorites (X-User-Email) → FavoritesAnswer
favoritesRoutes.get('/', (req, res) => {
  sendResult(res, getFavorites(parseUserEmail(req)));
});

// POST /api/favorites/:id/toggle (X-User-Email) → ToggleFavoriteAnswer
favoritesRoutes.post('/:id/toggle', async (req, res) => {
  const id = parseShowId(req.params.id);
  sendResult(res, id.ok ? await toggleFavorite(parseUserEmail(req), id.data) : id);
});
