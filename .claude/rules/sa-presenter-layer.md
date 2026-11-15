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

When `usePresenter` grows, split it by meaning into separate hooks (`useShowsSearch.ts`, `useSearchRequest.ts`) and plain functions (`getSelection.ts`, `getShownAnswer.ts`) in the same `logic/` folder. Business logic (talking to the server, changing the store) goes to tasks. `usePresenter` then reads like a table of contents: it composes the pieces and maps them to what the View renders.

```ts
// ShowsExplorer/logic/usePresenter.ts (shortened)
export function usePresenter() {
  const initial = useInitialSearchUrl();
  const search = useShowsSearch(initial);          // calls the searchShows task
  const result = search.shownAnswer?.result ?? null;
  const selection = getSelection(search.status, search.request, result);

  return {
    query: search.query,
    onQueryChange: search.changeQuery,
    genres: result?.genres ?? NO_GENRES,
    selectedGenre: selection.genre,
    onGenreChange: search.selectGenre,
    shows: result?.shows ?? NO_SHOWS,
    // …
  };
}
```

## State and requests

Keep the data flow simple and predictable:

- **No `setState` during render.** Not even guarded by a condition — it is easy to loop and hard to read.
- **A change caused by the user is set in the handler**, not derived in an effect. Debounce lives in the handler too: a timer in `useRef`, cleared on each change and on unmount.
- **In an effect, `setState` only in async callbacks** (`.then`, `.catch`), never synchronously in its body.
- **A request is an object in state**, created by the handler (`{ query, genre, page }`); Retry creates a new object with the same values. The effect depends on that object and only loads it, through a task (`searchShows(request, signal)`).
- **One cancellation mechanism: `AbortController`** — abort in the effect cleanup, ignore the answer if `signal.aborted`.
- **An answer belongs to its request by reference** (`answer.request === request`), not by string keys or counters.
- **Calling a task**: `const result = await task()`, then branch on `result.ok` (data → render or toast; `result.error` → error state or toast). No try/catch around a task: it never throws, it already logged the error. Keep pending flags local (`setIsPending(true)` before, `false` after). No Redux round-trip for loading flags.

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
```

```ts
// logic/useSearchRequest.ts — debounce in the handler
const changeQuery = (value: string) => {
  setQuery(value);
  clearTimeout(timerRef.current);
  const trimmed = value.trim();
  if (!trimmed) return setRequest(null);
  timerRef.current = setTimeout(
    () => setRequest((current) =>
      current?.query === trimmed ? current : { query: trimmed, genre: null, page: 1 }),
    SEARCH_DEBOUNCE_MS,
  );
};

// logic/useShowsSearch.ts — the effect only loads the current request via the task
useEffect(() => {
  if (!request) return;
  const controller = new AbortController();
  searchShows(request, controller.signal).then((result) => {
    if (controller.signal.aborted) return;
    setAnswer(result.ok
      ? { request, result: result.data, error: null }
      : { request, result: null, error: result.error });
  });
  return () => controller.abort();
}, [request]);
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
- A task that shows a toast or navigates: the presenter does that with the task's result.
- Data rules (filtering, pagination, caching) in the presenter: they belong to the server (`sa-backend.md`).
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.

## Checklist

- Presenter exists only if the component has logic; it returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Server calls and store writes go through tasks; toasts/navigation stay here.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
