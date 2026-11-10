---
description: Simple Architecture — one folder per component, single-use children nested in the parent, folders mirror the UI
paths:
  - "src/**/*"
---

# Tree-shaped component folders

Every component has **its own folder** containing its View, Presenter and styles:

```
ShowCard/
  ShowCard.tsx          # View — file name = folder name (PascalCase)
  usePresenter.ts       # Presenter
  styles.module.css     # CSS Module
```

A component used in **only one place** lives **inside the folder of the component that uses it**. Nesting depth is unlimited — the folder tree should mirror what the user sees on screen, so you can find any component by walking the UI.

Import with the duplicated name: `import { ShowCard } from './ShowCard/ShowCard';` (no `index.tsx` files).

## Styles

- Use plain **CSS Modules** (`styles.module.css`), imported as `styles`.
- Use **CSS variables** for shared values (colors, spacing) — no Sass/Less/Stylus.

## Good

```
App/
  App.tsx
  usePresenter.ts
  styles.module.css
  ShowsExplorer/
    ShowsExplorer.tsx
    usePresenter.ts
    SearchInput/
      SearchInput.tsx
      usePresenter.ts
      styles.module.css
    ShowsList/
      ShowsList.tsx
      usePresenter.ts
      ShowCard/
        ShowCard.tsx
        usePresenter.ts
```

## Bad

```
src/
  components/ShowCard.tsx       # single-use component in a shared folder
  hooks/useShowsSearch.ts       # logic separated from its component
  ShowsList/index.tsx           # index.tsx instead of ShowsList.tsx
  styles/ShowsList.scss         # preprocessor, styles away from component
```
