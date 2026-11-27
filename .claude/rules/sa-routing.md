---
description: Simple Architecture — the Router (VIPER's R) is not a layer: pages are route components, navigation and URL state live in the presenter layer through react-router hooks; HashRouter for static hosting
paths:
  - "src/main.tsx"
  - "src/App/**"
---

# Routing: the R of VIPER

Navigation is not business logic: "log out" means the same on the web and in a mobile app, but *what happens next* depends on the environment. So the Router gets no own layer — **navigation lives in the presenter layer**, and tasks only return what happened.

## Pages

- `react-router`, set up once in `src/main.tsx` (the composition root): `<HashRouter><App /></HashRouter>`.
- **`HashRouter`** (`#/`, `#/login`) because the app is served as static files (GitHub Pages): a reload of `/login` would be a 404 there, a reload of `#/login` is not.
- `App.tsx` is layout + `<Routes>` only. Every page is a route component under `App/` with the usual folder (`LoginPage/LoginPage.tsx`, `logic/`, `types.ts`, …); a catch-all `*` route redirects home.

```tsx
<Routes>
  <Route path="/" element={<Shop />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## Who may use what

| Where | Allowed | Why |
|---|---|---|
| View (`*.tsx`) | router **components**: `<Routes>`, `<Route>`, `<Navigate>`, `<Link>` | they are markup: "these are the pages", "redirect here", "a link" |
| Presenter layer (`logic/usePresenter.ts` and its hooks in `logic/`) | `useNavigate`, `useLocation`, `useSearchParams` | deciding *when* and *where* to go is presenter logic |
| Tasks, store, API, `lib/` | nothing from `react-router` | they don't know about the environment; a task returns a result, the presenter navigates |

ESLint: hook calls in a View are errors (`simple-architecture/view-layer`); `react-router` imports are errors in tasks, entities, `src/api` and `lib` (`deps-*`).

## Patterns

- **Go to a page from a handler**: `onLogIn: () => navigate('/login', { state: { from: currentPath } })`.
- **Come back after a detour** (e.g. login): pass `state.from` (`pathname + search` of the current page), read it on the target page with a small pure function that only accepts internal paths (`getReturnPath(location.state)`), fall back to `/`.
- **Redirect driven by state**: when a store change decides the page (logged in → leave the login page), the presenter returns `redirectTo` and the View renders `<Navigate to={redirectTo} replace />`. No imperative `navigate` racing the re-render.
- **The URL is an output, not a trigger.** A handler changes the state and calls the task itself (`onGenreChange → load({ …params, genre })`); the URL follows the state. Never a chain "handler changes the URL → an effect sees it → load": it is harder to follow and loads twice on mistakes.
- **URL state** (`?q=&genre=&page=`) is read and written through `useSearchParams` — the initial state from it on the first render, updates with `setSearchParams(…, { replace: true })`. Never `window.location` / `history` directly: with `HashRouter` the query lives inside the hash.
- **Tests**: presenters that navigate are rendered inside `MemoryRouter` (`renderHookInRouter(hook, url, state)` in `src/testUtils/`), and assert on the returned `location`.

## Bad

```ts
// a task
navigate('/');                                  // navigation in a task: return a result instead
// a View
const navigate = useNavigate();                 // hook in a View: the presenter returns onX
// a presenter
window.history.replaceState(null, '', `?q=${q}`); // bypasses the router (breaks with HashRouter)
```
