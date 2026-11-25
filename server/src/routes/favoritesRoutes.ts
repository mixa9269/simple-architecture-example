import { Router } from 'express';
import { getFavorites } from '~/tasks/getFavorites';
import { toggleFavorite } from '~/tasks/toggleFavorite';
import { parseShowId } from './parseShowsQuery';
import { sendResult } from './sendResult';

export const favoritesRoutes = Router();

// GET /api/favorites → FavoritesAnswer
favoritesRoutes.get('/', (_req, res) => {
  sendResult(res, getFavorites());
});

// POST /api/favorites/:id/toggle → ToggleFavoriteAnswer
favoritesRoutes.post('/:id/toggle', async (req, res) => {
  const id = parseShowId(req.params.id);
  sendResult(res, id.ok ? await toggleFavorite(id.data) : id);
});
