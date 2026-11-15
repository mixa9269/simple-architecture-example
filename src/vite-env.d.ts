/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend, e.g. https://shows-api.onrender.com; empty in dev. */
  readonly VITE_API_URL?: string;
}
