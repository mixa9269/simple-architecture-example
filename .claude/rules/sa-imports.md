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

- Code of the **own folder** and **own children** is imported relatively: `./logic/usePresenter`, `./types`, `./ProductCard/ProductCard`, `./tasks/addToCart`.
- `logic/` is a subfolder: from there, the component's own `types.ts` is reached via `~/…/types`.
- Anything **outside the own folder** (a parent, a sibling of a parent, `components/` above in the tree) is imported through `~/`: `~/App/Shop/types`.
- Never `../` — the path then says where the code is, not how deep the importer happens to be, and moving a folder does not break its imports.

ESLint: `no-restricted-imports` with the pattern `^\.\./` (`eslint/simple-architecture.js`), for `src/`, `server/` and `shared/`.

## Good

```ts
// src/App/Shop/ProductList/ProductCard/types.ts
import type { Product } from '~shared/api';

// src/App/Shop/ProductList/ProductCard/logic/usePresenter.ts
import type { Props } from '~/App/Shop/ProductList/ProductCard/types';

// server/src/tasks/addToCart.ts
import { addCartItem } from '~/entities/cart';
```

```tsx
// src/App/Shop/ProductList/ProductList.tsx
import { ProductCard } from './ProductCard/ProductCard';
import type { Props } from './types';
```

## Bad

```ts
import type { Product } from '../../types';       // parent via ../
import type { Props } from '../types';            // the component's types from logic/ via ../ (use ~/)
import { ProductCard } from '~/App/Shop/ProductList/ProductCard/ProductCard'; // own child via ~/ (use ./)
import type { Product } from '@/App/Shop/types';  // old alias
```
