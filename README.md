# simple-architecture-example

Homework projects for the **Simple Architecture** online bootcamp (React).

## TV Shows Explorer

Search TV shows from the public [TVmaze API](https://www.tvmaze.com/api) through our own backend.

Homework #1 (frontend):

- debounced search with cancellation of outdated requests (hand-written, no `useQuery`)
- found shows stay on screen while the next query, genre or page loads; skeletons only when there is nothing to show
- loading skeletons, error state with retry, empty state
- search state in the URL (`?q=…&genre=…&page=…`): you can share it and it survives a reload
- pagination (3 shows per page) and genre filter chips with reset ("All")

Homework #2 (fullstack):

- an **Express backend** (`server/`) talks to TVmaze and does the genre filtering and the pagination
- a **5-minute cache** (`const cache = {}`): the same TVmaze request within 5 minutes is answered from memory
- **favorites**: a star on each show, a toast on add/remove, a header button with the count that opens the list. All favorites logic is on the server (`const favorite = {}`), the Redux store only mirrors it
- the project follows lecture 2: **Tasks** (business logic), **Entities** (store), `logic/` folders

Stack: Vite, React, TypeScript, [Mantine](https://mantine.dev) (+ notifications), Redux Toolkit, CSS Modules, Express, Vitest.

## API

| Method | Path | Answer |
|---|---|---|
| GET | `/api/shows?q=&genre=&page=` | `ShowsPage`: one page of results, applied genre/page, all genres, counts |
| GET | `/api/favorites` | `{ shows }`, newest first |
| POST | `/api/favorites/:id/toggle` | `{ show, isFavorite, favorites }` |
| GET | `/api/health` | `{ ok: true }` |

The contract types are in [`shared/api.ts`](shared/api.ts). The data lives in the server's memory: a restart clears the cache and the favorites.

## Run

```bash
npm i
npm run dev        # web on http://localhost:5173 + API on http://localhost:3001 (Vite proxies /api)
npm run lint       # ESLint incl. Simple Architecture rules
npm run typecheck  # frontend + backend + shared contract
npm test           # Vitest: projects "web" (jsdom) and "server" (node)
npm run build
```

`npm run dev:web` / `npm run dev:server` start one side only. The server logs every real TVmaze call (`TVmaze GET …`), so cache hits show up as missing log lines.

## Deploy

- **Frontend**: GitHub Pages (`.github/workflows/deploy.yml`). The production build takes the backend URL from [`.env.production`](.env.production) (`VITE_API_URL`). `npm run dev` and the tests don't read that file, so they keep using the local server.
- **Backend**: Render, from [`render.yaml`](render.yaml) (`npm ci`, `npm run start:server`, `CORS_ORIGIN` = the Pages origin): https://simple-architecture-shows-api.onrender.com

If the Render URL changes, update `.env.production`. On the free plan the service sleeps when idle: the first request takes up to ~50 s, and a restart clears the cache and the favorites.

## AI rules

Architecture rules for Claude Code live in [`.claude/rules`](.claude/rules):

- VIPER mapping: View = component, Presenter = `logic/usePresenter`, Interactor = **Tasks**, Entity = Redux store, Router stays in the presenter
- View layer = JSX + `usePresenter(props)` only; a component without logic is plain JSX
- All JS logic of a component lives in its `logic/` folder; business logic in `logic/tasks/`, reusable tasks in `src/tasks/`
- Servers are called through an API object: `api.shows.search()`, `api.favorites.toggle(id)` (`tvmaze.shows.get(id)` on the server)
- A task is a verb-named arrow function: `try { await api.x.y() } catch (error) { console.error }`, returning `{ ok, data }` / `{ ok: false, error }`; no React, no Mantine; writes the store via `store.dispatch`. The presenter branches on `result.ok`; toasts and navigation stay in the presenter
- Store = domain data only (no loading flags); presenters `useSelector`, tasks dispatch directly (no thunks)
- Backend: thin Express routes → tasks (no `express` imports) → in-memory entities. Data rules live on the server, presentation on the client
- No `setState` during render; requests are objects in state, cancelled with `AbortController`
- `types.ts` with `Props` next to each component; imports outside the own folder via `~/`, never `../`
- Max 120 lines per file; tree-shaped component folders; `components/` folders hold reusable components only

ESLint enforcement ([`eslint/simple-architecture.js`](eslint/simple-architecture.js)): file size, hooks in Views, whole props, `../` imports, the presenter in `logic/`, no React/Mantine/`fetch`/transport in tasks, arrow functions in tasks and API objects, no Express in server tasks/entities.

Course materials are kept locally in `course-materials/` (git-ignored).
