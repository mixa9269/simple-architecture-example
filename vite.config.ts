import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// ~/ = src/ (frontend) or server/src/ (backend), ~shared/ = shared/ —
// keep in sync with "paths" in tsconfig.app.json and server/tsconfig.json
const sharedAlias = { '~shared': path('./shared') };

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the app works at / and under /simple-architecture-example/ on GitHub Pages.
  base: './',
  plugins: [react()],
  resolve: {
    alias: { ...sharedAlias, '~': path('./src') },
  },
  server: {
    // The backend in dev: `npm run dev:server` (see server/src/index.ts).
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'web', environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
      },
      {
        resolve: { alias: { ...sharedAlias, '~': path('./server/src') } },
        test: { name: 'server', environment: 'node', include: ['server/**/*.test.ts'] },
      },
    ],
  },
});
