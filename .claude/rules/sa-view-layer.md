---
description: Simple Architecture — a React component is the View layer only (JSX + usePresenter), no JS logic
paths:
  - "src/**/*.tsx"
---

# View layer: JSX + `usePresenter` only

Every React component is the **View** layer. It contains exactly two things: a call to its own `usePresenter()` hook and JSX. No other JS logic — no `useState`/`useEffect`/other hooks, no computations, no handlers with bodies, no data fetching.

## Allowed imports in a View file

- its own `./usePresenter`
- its own `./styles.module.css`
- child components (nested folders or `components/` above in the tree)
- types (`import type ...`)

## Good

```tsx
import { usePresenter } from './usePresenter';
import { ShowCard } from './ShowCard/ShowCard';
import styles from './styles.module.css';

export function ShowsList() {
  const { shows, isEmpty } = usePresenter();

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

export function ShowsList({ query }: { query: string }) {
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
