---
description: Simple Architecture — usePresenter holds 100% of a component's logic; split it into smaller hooks and functions
paths:
  - "src/**/*.ts"
---

# Presenter layer: `usePresenter`

Each component folder has a `usePresenter.ts` hook. It takes **all** logic of the component — state, effects, data loading, derived values, handlers — and returns a flat object with everything the View needs.

When `usePresenter` grows, split it by meaning into separate hooks (`useShowsSearch.ts`, `useGenreFilter.ts`) and plain functions (`validateQuery.ts`, `collectGenres.ts`) in the same folder. `usePresenter` then reads like a table of contents: it composes the pieces and maps them to what the View renders.

## Good

```ts
// ShowsExplorer/usePresenter.ts
import { useShowsSearch } from './useShowsSearch';
import { useGenreFilter } from './useGenreFilter';

export function usePresenter() {
  const { query, setQuery, shows, isLoading, error } = useShowsSearch();
  const { genres, selectedGenre, selectGenre, resetGenre, filteredShows } =
    useGenreFilter(shows);

  return {
    query,
    onQueryChange: setQuery,
    isLoading,
    error,
    genres,
    selectedGenre,
    onGenreSelect: selectGenre,
    onGenreReset: resetGenre,
    shows: filteredShows,
  };
}
```

```ts
// ShowsExplorer/useShowsSearch.ts — debounce, AbortController, loading/error
```

## Bad

- One 250-line `usePresenter` with search, debounce, abort, pagination and genre filtering all inline.
- Returning raw API objects and letting the View dig into them (`show.show.image?.medium`); format data for the View in the presenter.
- Putting logic back into the component "because it's just one line".

## Checklist

- Presenter returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
