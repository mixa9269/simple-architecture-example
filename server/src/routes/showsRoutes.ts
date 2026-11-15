import { Router } from 'express';
import { searchShows } from '~/tasks/searchShows/searchShows';
import { parseShowsQuery } from './parseShowsQuery';
import { sendResult } from './sendResult';

export const showsRoutes = Router();

// GET /api/shows?q=&genre=&page= → ShowsPage
showsRoutes.get('/', async (req, res) => {
  const query = parseShowsQuery(req.query);
  sendResult(res, query.ok ? await searchShows(query.data) : query);
});
