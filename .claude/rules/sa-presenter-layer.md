---
description: Simple Architecture — usePresenter is the bridge between the View and the tasks (UI state, handlers, toasts); split it into smaller hooks and functions; state and requests without setState in render
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
| reads the store: `useSelector` | writes the store: `store.dispatch` |

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

When `usePresenter` grows, split it by meaning into separate hooks (`useSearchUrl.ts`, `useIsSlow.ts`) and plain functions (`formatSummary.ts`, `keepUnstarred.ts`) in the same `logic/` folder. Business logic (talking to the server, changing the store) goes to tasks; shared state goes to the store and is read with selectors. `usePresenter` then reads like a table of contents: it reads what the View needs and wires the events to tasks.

```ts
// GenreChips/logic/usePresenter.ts — reads the store, picks the task
export function usePresenter() {
  const result = useSelector(selectShownResult);
  const { genre } = useSelector(selectSelection);
  const genres = result?.genres ?? NO_GENRES;

  return {
    isHidden: !result?.total || genres.length === 0,
    items: [{ value: ALL_GENRES, label: 'All' }, ...genres.map((item) => ({ value: item, label: item }))],
    value: genre ?? ALL_GENRES,
    onChange: (value: string) => selectGenre(value === ALL_GENRES ? null : value),
  };
}
```

## The flow

Click → View (`onChange`) → **Presenter** (knows from the store what is shown and selected, picks the task) → **Task** (request, writes the store) → **Store** → every presenter that reads it re-renders → View.

A child that needs shared data reads it **itself** through its own presenter and selectors, and calls the task itself. The parent does not collect 20 props for its children; it is often just layout (`ShowsExplorer`).

## State and requests

Keep the data flow simple and predictable:

- **Data is loaded from handlers, through tasks**: `onChange → selectGenre(genre)`, `onChange → typeQuery(value)`. Not in `useEffect` reacting to state.
- **`useEffect` only for startup and subscriptions/timers**: restoring the search from the URL once, syncing the URL, a "slow request" timer.
- **No `setState` during render.** Not even guarded by a condition — it is easy to loop and hard to read.
- **In an effect, `setState` only in async callbacks** (`.then`, a timer callback), never synchronously in its body.
- **Debounce** is a `lib/debounce` utility used by the task (`typeQuery` → `debounce(searchShows, 400)`), not a timer juggled in the presenter.
- **Requests and cancellation live in the loading task**: a request is an object (`{ query, genre, page }`) stored with `requestStarted`; Retry stores a new object with the same values. The task keeps the current `AbortController` in its module and stores nothing for an aborted load.
- **An answer belongs to its request by reference** (`answer.request === request`), not by string keys or counters. Redux keeps stored objects by reference, so this works in the store too.
- **Calling a task**: `const result = await task()`, then branch on `result.ok` (data → render or toast; `result.error` → error state or toast). No try/catch around a task: it never throws, it already logged the error. Keep pending flags local (`setIsPending(true)` before, `false` after). No Redux round-trip for loading flags.
- **`useCallback` / `useMemo` only where a stable reference matters** (a dependency of an effect, a prop of a memoized child). Derived store data is memoized by `createSelector`, not in the presenter.

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

// SearchInput/logic/usePresenter.ts — the handler calls the task; the task stores the text and debounces
onChange: (event: ChangeEvent<HTMLInputElement>) => typeQuery(event.currentTarget.value),
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
- A parent passing store data down as props to children that could read it themselves.
- `useCallback` around every handler "just in case".
- A task that shows a toast or navigates: the presenter does that with the task's result.
- Data rules (filtering, pagination, caching) in the presenter: they belong to the server (`sa-backend.md`).
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.

## Checklist

- Presenter exists only if the component has logic; it returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Server calls and store writes go through tasks; toasts/navigation stay here.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
