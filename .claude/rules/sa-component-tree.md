---
description: Simple Architecture — one folder per component, single-use children nested in the parent, folders mirror the UI
paths:
  - "src/**/*"
---

# Tree-shaped component folders

Every component has **its own folder**:

```
ShowCard/
  ShowCard.tsx          # View — file name = folder name (PascalCase)
  types.ts              # Props + other types of this component — only if it has any
  styles.module.css     # CSS Module(s)
  logic/                # only if the component has logic (see sa-logic-folder.md)
    usePresenter.ts     # Presenter + smaller hooks + helpers + tests
    tasks/              # business logic of this component (see sa-tasks-layer.md)
```

`types.ts` exports the props interface named simply `Props` and any other types the component owns. View and Presenter both import it: `import type { Props } from './types'`.

- Types shared by several components go to the `types.ts` of their nearest common ancestor (e.g. `Show` in `ShowsExplorer/types.ts`).
- A parent rarely needs a child's props type; when it does, rename on import: `import type { Props as ShowCardProps } from './ShowCard/types'`.
- A component without props and without own types has no `types.ts`; a component without logic has no `logic/`.

A component used in **only one place** lives **inside the folder of the component that uses it**. Nesting depth is unlimited — the folder tree should mirror what the user sees on screen, so you can find any component by walking the UI.

Import with the duplicated name: `import { ShowCard } from './ShowCard/ShowCard';` (no `index.tsx` files). Imports from outside the own folder go through `~/` (see `sa-imports.md`).

## Styles

- Use plain **CSS Modules** (`*.module.css`), next to the component.
- One `styles.module.css` by default. If it grows while the JSX does not need splitting, split the styles into several files in the same folder (`styles.module.css`, `poster.module.css`).
- Use **CSS variables** for shared values (colors, spacing) — no Sass/Less/Stylus.

## Good

```
App/
  App.tsx                 # static layout — no logic/
  styles.module.css
  FavoritesButton/
    FavoritesButton.tsx
    logic/
      usePresenter.ts
      tasks/loadFavorites.ts
    FavoritesList/
  ShowsExplorer/
    ShowsExplorer.tsx     # layout only
    logic/
      usePresenter.ts
      useSearchUrl.ts
    tasks/                # search tasks reused by the children below
      typeQuery.ts, selectGenre.ts, selectPage.ts, loadSearch.ts
    SearchInput/
      SearchInput.tsx     # today reads the search slice: known deviation (sa-entities.md)
      styles.module.css
      logic/usePresenter.ts
    ShowsList/
      ShowsList.tsx
      logic/usePresenter.ts
      ShowCard/
        ShowCard.tsx
        types.ts
        logic/usePresenter.ts
      ShowCardSkeleton/
        ShowCardSkeleton.tsx   # no props, no logic
        styles.module.css
```

## Bad

```
src/
  components/ShowCard.tsx       # single-use component in a shared folder
  hooks/useShowsSearch.ts       # logic separated from its component
  ShowsList/index.tsx           # index.tsx instead of ShowsList.tsx
  ShowsList/usePresenter.ts     # presenter outside logic/
  ShowsList/logic/usePresenter.ts  # exporting Props (the props type belongs in types.ts)
  styles/ShowsList.scss         # preprocessor, styles away from component
```
