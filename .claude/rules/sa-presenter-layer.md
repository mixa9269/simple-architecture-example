---
description: Simple Architecture — usePresenter holds 100% of a component's logic; split it into smaller hooks and functions; state and requests without setState in render
paths:
  - "src/**/usePresenter.ts"
---

# Presenter layer: `usePresenter`

A component **with logic** has a `usePresenter.ts` hook next to it. It takes **all** logic of the component — state, effects, data loading, derived values, handlers — and returns a flat object with everything the View needs.

A component **without logic** (static texts, layout, a constant list rendered with `map`) has no presenter: keep it simple, write it in JSX (see `sa-view-layer.md`).

## Signature: `usePresenter(props: Props)`

- The presenter takes the component's props **whole**, typed by `Props` from `./types.ts`, and destructures them in its body. Props it does not need are simply not destructured.
- A presenter of a component without props takes no parameters.
- ESLint: a destructured `usePresenter` parameter is an error.

```ts
// ShowCard/usePresenter.ts
import type { Props } from './types';

export function usePresenter(props: Props) {
  const { show } = props;

  return { name: show.name, meta: formatMeta(show.year, show.rating) };
}
```

## Splitting

When `usePresenter` grows, split it by meaning into separate hooks (`useShowsSearch.ts`, `useSearchSelection.ts`) and plain functions (`buildResultsView.ts`, `collectGenres.ts`) in the same folder. `usePresenter` then reads like a table of contents: it composes the pieces and maps them to what the View renders.

```ts
// ShowsExplorer/usePresenter.ts (shortened)
export function usePresenter() {
  const initial = useInitialSearchUrl();
  const search = useShowsSearch(initial.query);
  const shown = search.shownAnswer;
  const selection = useSearchSelection(shown, { request: search.request, genre: initial.genre, page: initial.page });
  const view = useMemo(() => buildResultsView(shows, selection.genre, selection.page), [...]);

  return {
    query: search.query,
    onQueryChange: search.changeQuery,
    genres: view.genres,
    onGenreChange: selection.selectGenre,
    shows: view.pageItems,
    // …
  };
}
```

## State and requests

Keep the data flow simple and predictable:

- **No `setState` during render.** Not even guarded by a condition — it is easy to loop and hard to read.
- **A change caused by the user is set in the handler**, not derived in an effect. Debounce lives in the handler too: a timer in `useRef`, cleared on each change and on unmount.
- **In an effect, `setState` only in async callbacks** (`.then`, `.catch`), never synchronously in its body.
- **A request is an object in state**, created by the handler (`{ query }`); Retry creates a new object with the same query. The effect depends on that object and only loads it.
- **One cancellation mechanism: `AbortController`** — abort in the effect cleanup, ignore the answer if `signal.aborted`.
- **An answer belongs to its request by reference** (`answer.request === request`), not by string keys or counters. Data bound to an answer (selected genre, page) is bound to the same request object.

```ts
// useSearchQuery.ts — debounce in the handler
const changeQuery = (value: string) => {
  setQuery(value);
  clearTimeout(timerRef.current);
  const trimmed = value.trim();
  if (!trimmed) return setRequest(null);
  timerRef.current = setTimeout(
    () => setRequest((current) => (current?.query === trimmed ? current : { query: trimmed })),
    SEARCH_DEBOUNCE_MS,
  );
};

// useShowsSearch.ts — the effect only loads the current request
useEffect(() => {
  if (!request) return;
  const controller = new AbortController();
  searchShows(request.query, controller.signal)
    .then((shows) => { if (!controller.signal.aborted) setAnswer({ request, shows, error: null }); })
    .catch(/* same, with the error */);
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
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.

## Checklist

- Presenter exists only if the component has logic; it returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
