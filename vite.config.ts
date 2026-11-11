import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the app works at / and under /simple-architecture-example/ on GitHub Pages.
  base: './',
  plugins: [react()],
  resolve: {
    // @/ = src/ — keep in sync with "paths" in tsconfig.app.json
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
  },
});
