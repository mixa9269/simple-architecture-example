---
description: Simple Architecture — a React component is the View layer only (JSX + usePresenter), no JS logic
paths:
  - "src/**/*.tsx"
---

# View layer: JSX + `usePresenter` only

Every React component is the **View** layer. It contains exactly two things: a call to its own `usePresenter(props)` hook and JSX. No other JS logic — no `useState`/`useEffect`/other hooks, no computations, no handlers with bodies, no data fetching.

## Props: whole object in, whole object on

- The component takes `props` typed by `<Name>Props` from its own `./types.ts` — never destructured in the signature.
- It passes `props` whole to the presenter: `usePresenter(props)`. A component without props has no `types.ts` and calls `usePresenter()`.
- The View reads values only from what `usePresenter` returns, not from `props` directly.

ESLint: destructured component params and `usePresenter(anythingButProps)` are errors.

## Allowed imports in a View file

- its own `./usePresenter`
- its own `./types` (`import type { <Name>Props } from './types'`)
- its own `./styles.module.css`
- child components (nested folders, or `components/` above in the tree via `@/`)
- UI-library components (Mantine)

## Good

```tsx
import { ShowCard } from './ShowCard/ShowCard';
import styles from './styles.module.css';
import type { ShowsListProps } from './types';
import { usePresenter } from './usePresenter';

export function ShowsList(props: ShowsListProps) {
  const { shows, isEmpty } = usePresenter(props);

  if (isEmpty) return <p className={styles.empty}>Nothing found</p>;

  return (
    <ul className={styles.list}>
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </ul>
  );
}
```

Simple expressions needed to render (`map`, ternaries, passing a handler `onClick={onSelect}`, `onClick={() => onSelect(id)}`) are fine.

## Bad

```tsx
import { useEffect, useState } from 'react';

export function ShowsList({ query }: { query: string }) { // destructured, inline props type
  const [shows, setShows] = useState<Show[]>([]);   // state in View
  useEffect(() => {                                  // side effect in View
    fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
      .then((r) => r.json())
      .then(setShows);
  }, [query]);

  return (
    <ul>
      {shows.map((s) => (
        <li
          key={s.show.id}
          onClick={() => {                           // logic in JSX handler
            const genre = s.show.genres[0];
            console.log(genre);
          }}
        >
          {s.show.name}
        </li>
      ))}
    </ul>
  );
}
```

Move all of this into `usePresenter` (see `sa-presenter-layer.md`). `src/main.tsx` (app entry) is the only `.tsx` exempt from this rule.
