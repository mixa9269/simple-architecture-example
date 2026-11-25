---
description: Simple Architecture — usePresenter is the bridge between the View and the tasks: calls tasks, keeps their data locally and passes it down as props, returns ready-to-render values (contract with the View); reads only global data from the store
paths:
  - "src/**/logic/**"
---

# Presenter layer: `usePresenter`

A component **with logic** has a `logic/usePresenter.ts` hook (see `sa-logic-folder.md`). It serves the View: UI state, effects, derived values, handlers. It returns a flat object with everything the View needs. It also knows **which task to call on which event**: it is the bridge between the UI and the business logic (`sa-tasks-layer.md`).

| Presenter (`logic/usePresenter.ts`, hooks) | Task (`logic/tasks/`) |
|---|---|
| UI state: field value, loading/pending, opened drawer | the use case: what to send, what to store |
| handlers: `onToggle`, `onPageChange` | `toggleFavorite(id)`, `searchShows(request, signal)` |
| toasts, navigation, focus (they depend on the environment) | returns `{ ok, data }` / `{ ok: false, error }`; no React, no Mantine |
| branches on `result.ok` | catches and logs its own errors |
| keeps the screen's data from tasks (`useState`); reads global data (`useSelector`) | returns data; writes the store only for global data (`store.dispatch`) |

A component **without logic** (static texts, layout, a constant list rendered with `map`) has no presenter: keep it simple, write it in JSX (see `sa-view-layer.md`).

## Signature: `usePresenter(props: Props)`

- The presenter takes the component's props **whole**, typed by `Props` from `./types.ts`, and destructures them in its body. Props it does not need are simply not destructured.
- A presenter of a component without props takes no parameters.
- ESLint: a destructured `usePresenter` parameter is an error.

```ts
// ShowCard/logic/usePresenter.ts
import type { Props } from '~/App/ShowsExplorer/ShowsList/ShowCard/types';

export function usePresenter(props: Props) {
  const { show } = props;

  return { name: show.name, meta: formatMeta(show.year, show.rating) };
}
```

## Splitting

When `usePresenter` grows, split it by meaning into separate hooks (`useSearchUrl.ts`, `useIsSlow.ts`) and plain functions (`formatSummary.ts`, `keepUnstarred.ts`) in the same `logic/` folder. Business logic (talking to the server, changing global data) goes to tasks. `usePresenter` then reads like a table of contents: it calls tasks, keeps their data, and hands the View what it renders.

```ts
// GenreChips/logic/usePresenter.ts — gets the data as props, returns ready-to-render values
export function usePresenter(props: Props) {
  const { genres, selectedGenre, onChange } = props;

  return {
    items: [{ value: ALL_GENRES, label: 'All' }, ...genres.map((genre) => ({ value: genre, label: genre }))],
    value: selectedGenre ?? ALL_GENRES,
    onChange: (value: string) => onChange(value === ALL_GENRES ? null : value),
  };
}
```

## The flow

Event or mount → **Presenter** calls the **Task** → the task returns `{ ok, data | error }` → the presenter keeps it in `useState` → passes it down as **props** → **View**.

- **A screen's data lives in the presenter of the component that owns it** — the nearest component that all its users sit under — and goes down as props. It is not put in the store for convenience (see `sa-entities.md`).
- **Global data** (the store: favorites) is read with `useSelector` only by the presenters that need it, e.g. `FavoriteStar` and `FavoritesButton`.
- **View ↔ Presenter is a contract** (see `sa-dependencies.md`): the View asks for `value`, `options`, `onChange`, `disabled`; the presenter delivers exactly that, already formatted. The View never decides logic, and store or task changes stop at the presenter.

> Known deviation: the ShowsExplorer search children (`SearchInput`, `GenreChips`, `ResultsStatus`, `ShowsList`, `ResultsPagination`) currently read the `search` slice themselves. That code predates this rule (see `sa-entities.md`); don't copy it.

## State and requests

Keep the data flow simple and predictable:

- **Data is loaded through tasks**, from the handler that caused it (`onChange → loadPage(page)`) or once on mount (`useEffect` → task → `setState` in `.then`). Not in an effect reacting to state that a handler could have handled.
- **`useEffect` only for mount/startup and subscriptions/timers**: the first load, restoring from the URL, syncing the URL, a "slow request" timer.
- **No `setState` during render.** Not even guarded by a condition — it is easy to loop and hard to read.
- **In an effect, `setState` only in async callbacks** (`.then`, a timer callback), never synchronously in its body.
- **Debounce** is the `lib/debounce` utility, not a timer juggled by hand.
- **A request is an object** (`{ query, genre, page }`); Retry makes a new object with the same values. **One cancellation mechanism: `AbortController`** — pass its signal to the task and keep nothing from an aborted load.
- **An answer belongs to its request by reference** (`answer.request === request`), not by string keys or counters.
- **Calling a task**: `const result = await task()`, then branch on `result.ok` (data → render or toast; `result.error` → error state or toast). No try/catch around a task: it never throws, it already logged the error. Keep pending flags local (`setIsPending(true)` before, `false` after). No Redux round-trip for loading flags.
- **`useCallback` / `useMemo` only where a stable reference matters** (a dependency of an effect, a prop of a memoized child, an expensive derivation).

```ts
// FavoriteStar/logic/usePresenter.ts
const onToggle = async () => {
  setIsPending(true);
  const result = await toggleFavorite(show.id);
  setIsPending(false);
  notifications.show(
    result.ok ? getToggleToast(result.data.show, result.data.isFavorite) : getErrorToast(result.error),
  );
};

// HomePage/logic/usePresenter.ts — the task returns the data, the presenter keeps it
const [videos, setVideos] = useState<Video[]>([]);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
  loadHomePageVideos().then((result) =>
    result.ok ? setVideos(result.data) : setError(result.error),
  );
}, []);
```

## Bad

- `export function usePresenter({ show }: Props)` — props destructured in the signature.
- A props interface declared in `usePresenter.ts` (it belongs in `types.ts`).
- A presenter that only returns constants (`return { title: 'TV Shows Explorer' }`) — write them in JSX.
- `if (!query && result) setResult(null);` in the hook body — reset in the handler instead.
- Several "is this answer current?" mechanisms at once (`AbortController` + `requestKey` + answer ids).
- One 250-line `usePresenter` with search, debounce, abort, pagination and genre filtering all inline.
- `fetch`/`callApi`/`api.*` or `store.dispatch` right in the presenter: that is a task's job.
- `try { await task() } catch {…}` in the presenter: tasks report errors in their result.
- `useEffect(() => { load(request) }, [request])`: load from the handler that changed the request.
- Putting a screen's data, loading flag or error into the store so that children can read it — keep it in the owning presenter and pass props.
- `useCallback` around every handler "just in case".
- A task that shows a toast or navigates: the presenter does that with the task's result.
- Data rules (filtering, pagination, caching) in the presenter: they belong to the server (`sa-backend.md`).
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.

## Checklist

- Presenter exists only if the component has logic; it returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Server calls and store writes go through tasks; toasts/navigation stay here.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
