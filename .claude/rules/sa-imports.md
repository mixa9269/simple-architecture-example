---
description: Simple Architecture — imports: own folder and own children relative ('./…'), anything further up via the '~/' alias (= src/)
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Imports: `./` for own code, `~/` for everything else

`~/` is an alias of `src/` (`tsconfig.app.json` → `paths`, `vite.config.ts` → `resolve.alias`; Vitest uses the same config).

Why `~` and not `@`: `@/App/…` looks like a scoped package (`@mantine/core`) at a glance. `~` reads as "home of this project" — familiar to anyone who used a UNIX shell.

- Code of the **own folder** and **own children** is imported relatively: `./usePresenter`, `./types`, `./ShowCard/ShowCard`.
- Anything **outside the own folder** (a parent, a sibling of a parent, `components/` above in the tree) is imported through `~/`: `~/App/ShowsExplorer/types`.
- Never `../` — the path then says where the code is, not how deep the importer happens to be, and moving a folder does not break its imports.

ESLint: `no-restricted-imports` with the pattern `^\.\./` (`eslint/simple-architecture.js`).

## Good

```ts
// src/App/ShowsExplorer/ShowsList/ShowCard/types.ts
import type { Show } from '~/App/ShowsExplorer/types';
```

```tsx
// src/App/ShowsExplorer/ShowsList/ShowsList.tsx
import { ShowCard } from './ShowCard/ShowCard';
import type { Props } from './types';
```

## Bad

```ts
import type { Show } from '../../types';          // parent via ../
import { ShowCard } from '~/App/ShowsExplorer/ShowsList/ShowCard/ShowCard'; // own child via ~/ (use ./)
import type { Show } from '@/App/ShowsExplorer/types'; // old alias
```
