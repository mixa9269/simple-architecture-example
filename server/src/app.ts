import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { authRoutes } from './routes/authRoutes';
import { favoritesRoutes } from './routes/favoritesRoutes';
import { showsRoutes } from './routes/showsRoutes';

/** Allowed origins, comma-separated (e.g. the GitHub Pages site); any origin when not set. */
function getCorsOrigin(): string[] | boolean {
  const origins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());
  return origins?.length ? origins : true;
}

export function createApp() {
  const app = express();

  app.use(cors({ origin: getCorsOrigin() }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/login', authRoutes);
  app.use('/api/shows', showsRoutes);
  app.use('/api/favorites', favoritesRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Tasks report their errors as results; this catches only what slipped through (a bug).
  // Express recognizes an error handler by its four parameters.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}
