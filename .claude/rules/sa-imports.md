---
description: Simple Architecture — imports: own folder and own children relative ('./…'), anything further up via the '~/' alias (= src/ or server/src/), the API contract via '~shared/'
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "server/**/*.ts"
---

# Imports: `./` for own code, `~/` for everything else

`~/` is an alias of the code root of each side:

- frontend: `~/` = `src/` (`tsconfig.app.json` → `paths`, `vite.config.ts` → `resolve.alias`, Vitest project `web`);
- backend: `~/` = `server/src/` (`server/tsconfig.json` → `paths`, resolved by `tsx` at runtime, Vitest project `server`);
- both: `~shared/` = `shared/`, the API contract, imported with `import type` only.

Why `~` and not `@`: `@/App/…` looks like a scoped package (`@mantine/core`) at a glance. `~` reads as "home of this project" — familiar to anyone who used a UNIX shell.

- Code of the **own folder** and **own children** is imported relatively: `./logic/usePresenter`, `./types`, `./ShowCard/ShowCard`, `./tasks/searchShows`.
- `logic/` is a subfolder: from there, the component's own `types.ts` is reached via `~/…/types`.
- Anything **outside the own folder** (a parent, a sibling of a parent, `components/` above in the tree) is imported through `~/`: `~/App/ShowsExplorer/types`.
- Never `../` — the path then says where the code is, not how deep the importer happens to be, and moving a folder does not break its imports.

ESLint: `no-restricted-imports` with the pattern `^\.\./` (`eslint/simple-architecture.js`), for `src/`, `server/` and `shared/`.

## Good

```ts
// src/App/ShowsExplorer/ShowsList/ShowCard/types.ts
import type { Show } from '~shared/api';

// src/App/ShowsExplorer/ShowsList/ShowCard/logic/usePresenter.ts
import type { Props } from '~/App/ShowsExplorer/ShowsList/ShowCard/types';

// server/src/tasks/toggleFavorite.ts
import { addFavorite } from '~/entities/favorites';
```

```tsx
// src/App/ShowsExplorer/ShowsList/ShowsList.tsx
import { ShowCard } from './ShowCard/ShowCard';
import type { Props } from './types';
```

## Bad

```ts
import type { Show } from '../../types';          // parent via ../
import type { Props } from '../types';            // the component's types from logic/ via ../ (use ~/)
import { ShowCard } from '~/App/ShowsExplorer/ShowsList/ShowCard/ShowCard'; // own child via ~/ (use ./)
import type { Show } from '@/App/ShowsExplorer/types'; // old alias
```
