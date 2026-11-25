// Simple Architecture ESLint rules (flat config).
// Usage in eslint.config.js:
//   import simpleArchitecture from './eslint/simple-architecture.js';
//   export default [...otherConfigs, ...simpleArchitecture];
// Rules: .claude/rules/sa-file-size-120.md, sa-view-layer.md, sa-presenter-layer.md, sa-imports.md,
//        sa-logic-folder.md, sa-tasks-layer.md, sa-backend.md, sa-dependencies.md
// Import boundaries between layers and the no-cycle check: ./simple-architecture-dependencies.js

import dependencies from './simple-architecture-dependencies.js';

const VIEW_HINT =
  'Simple Architecture: move logic to usePresenter (see .claude/rules/sa-view-layer.md).';

const PROPS_HINT =
  'Simple Architecture: take props whole as `props: Props` and pass them on as usePresenter(props) (see .claude/rules/sa-presenter-layer.md).';

// Own folder and own children: './…'. Anything further up: '~/…' (see .claude/rules/sa-imports.md).
const PARENT_IMPORTS = {
  regex: '^\\.\\./',
  message:
    "Simple Architecture: import from outside the own folder via '~/…' (see .claude/rules/sa-imports.md).",
};

const API_HINT =
  'Simple Architecture: tasks call the API object — `await api.shows.search(…)` / `await tvmaze.shows.get(id)` (see .claude/rules/sa-api-layer.md).';

const ARROW_HINT =
  'Simple Architecture: tasks and API methods are arrow functions — `export const name = async (…) => {…}` (see .claude/rules/sa-tasks-layer.md).';

const NO_FETCH = ['error', { name: 'fetch', message: API_HINT }];

const ARROW_ONLY = [
  'error',
  { selector: 'ExportNamedDeclaration > FunctionDeclaration', message: ARROW_HINT },
];

const ALL_CODE = ['src/**/*.{js,jsx,ts,tsx}', 'server/**/*.ts', 'shared/**/*.ts'];


export default [
  {
    name: 'simple-architecture/imports',
    files: ALL_CODE,
    rules: {
      'no-restricted-imports': ['error', { patterns: [PARENT_IMPORTS] }],
    },
  },
  {
    name: 'simple-architecture/presenter-props',
    files: ['src/**/logic/usePresenter.{js,ts}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration[id.name="usePresenter"] > ObjectPattern',
          message: `usePresenter takes the whole props object. ${PROPS_HINT}`,
        },
      ],
    },
  },
  {
    name: 'simple-architecture/file-size',
    files: ALL_CODE,
    rules: {
      'max-lines': [
        'error',
        { max: 120, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  {
    name: 'simple-architecture/view-layer',
    files: ['src/**/*.{jsx,tsx}'],
    ignores: ['src/main.{jsx,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name=/^use(?!Presenter$)[A-Z]/]',
          message: `Only usePresenter() may be called in a View. ${VIEW_HINT}`,
        },
        {
          selector:
            'CallExpression[callee.type="MemberExpression"][callee.property.name=/^use[A-Z]/]',
          message: `Hooks are not allowed in a View. ${VIEW_HINT}`,
        },
        {
          selector: 'JSXAttribute ArrowFunctionExpression[body.type="BlockStatement"]',
          message: `No handler logic inside JSX. ${VIEW_HINT}`,
        },
        {
          selector:
            ':matches(FunctionDeclaration[id.name=/^[A-Z]/], VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression) > ObjectPattern',
          message: `A component takes the whole props object. ${PROPS_HINT}`,
        },
        {
          selector:
            'CallExpression[callee.name="usePresenter"] > :not(Identifier[name="usePresenter"], Identifier[name="props"])',
          message: `Pass the whole props object to usePresenter. ${PROPS_HINT}`,
        },
      ],
    },
  },
  {
    name: 'simple-architecture/tasks',
    files: ['src/**/tasks/**/*.{js,ts}'],
    ignores: ['**/*.test.{js,ts}', '**/*TestUtils.{js,ts}'],
    rules: {
      'no-restricted-globals': NO_FETCH,
      'no-restricted-syntax': ARROW_ONLY,
    },
  },
  {
    name: 'simple-architecture/server-tasks',
    files: ['server/src/tasks/**/*.ts', 'server/src/entities/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*TestUtils.ts'],
    rules: {
      'no-restricted-globals': NO_FETCH,
    },
  },
  {
    name: 'simple-architecture/server-tasks-arrows',
    files: ['server/src/tasks/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*TestUtils.ts'],
    rules: { 'no-restricted-syntax': ARROW_ONLY },
  },
  {
    name: 'simple-architecture/api-layer',
    files: ['src/api/**/*.ts', 'server/src/tvmaze/tvmaze.ts'],
    ignores: ['**/*.test.ts', '**/*TestUtils.ts'],
    rules: { 'no-restricted-syntax': ARROW_ONLY },
  },
  ...dependencies,
];
