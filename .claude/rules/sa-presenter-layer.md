---
description: Simple Architecture — usePresenter holds 100% of a component's logic; split it into smaller hooks and functions
paths:
  - "src/**/*.ts"
---

# Presenter layer: `usePresenter`

Each component folder has a `usePresenter.ts` hook. It takes **all** logic of the component — state, effects, data loading, derived values, handlers — and returns a flat object with everything the View needs.

## Signature: `usePresenter(props: <Name>Props)`

- The presenter takes the component's props **whole**, typed by the same `<Name>Props` from `./types.ts`, and destructures them in its body. Props it does not need are simply not destructured.
- A presenter of a component without props takes no parameters.
- ESLint: a destructured `usePresenter` parameter is an error.

```ts
// ShowCard/usePresenter.ts
import type { ShowCardProps } from './types';

export function usePresenter(props: ShowCardProps) {
  const { show } = props;

  return { name: show.name, meta: formatMeta(show.year, show.rating) };
}
```

## Splitting

When `usePresenter` grows, split it by meaning into separate hooks (`useShowsSearch.ts`, `useSearchSelection.ts`) and plain functions (`buildResultsView.ts`, `collectGenres.ts`) in the same folder. `usePresenter` then reads like a table of contents: it composes the pieces and maps them to what the View renders.

## Good

```ts
// ShowsExplorer/usePresenter.ts (shortened)
export function usePresenter() {
  const initial = useInitialSearchUrl();
  const search = useShowsSearch(initial.query);
  const selection = useSearchSelection(search.shownResult, initial);
  const view = useMemo(() => buildResultsView(shows, selection.genre, selection.page), [...]);

  return {
    query: search.query,
    onQueryChange: search.setQuery,
    genres: view.genres,
    onGenreChange: selection.selectGenre,
    shows: view.pageItems,
    // …
  };
}
```

```ts
// ShowsExplorer/useShowsSearch.ts — debounce, AbortController, loading/error
```

## Bad

- `export function usePresenter({ show }: ShowCardProps)` — props destructured in the signature.
- A props interface declared in `usePresenter.ts` (it belongs in `types.ts`).
- One 250-line `usePresenter` with search, debounce, abort, pagination and genre filtering all inline.
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.
- Putting logic back into the component "because it's just one line".

## Checklist

- Presenter returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
