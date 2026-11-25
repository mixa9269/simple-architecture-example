// Simple Architecture — direction of dependencies (flat config), see .claude/rules/sa-dependencies.md.
// One `no-restricted-imports` config per layer: in flat config the last matching config replaces the
// options of earlier ones, so every layer repeats the shared bans (`restrictImports` adds them).
// Layers here have disjoint `files`; the base `simple-architecture/imports` covers everything else.

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';

const DEPS = 'see .claude/rules/sa-dependencies.md';
const TESTS = ['**/*.test.{js,ts,tsx}', '**/*TestUtils.{js,ts}'];

// Own folder and own children: './…'. Anything further up: '~/…' (see .claude/rules/sa-imports.md).
const PARENT_IMPORTS = {
  regex: '^\\.\\./',
  message:
    "Simple Architecture: import from outside the own folder via '~/…' (see .claude/rules/sa-imports.md).",
};

const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'useTransition',
  'useDeferredValue',
  'useSyncExternalStore',
];

// caseSensitive: ESLint matches `regex` patterns case-insensitively by default (`~/api/api` ≠ `Folder/Folder`).
const banRegex = (regex, why) => ({
  regex,
  caseSensitive: true,
  message: `Simple Architecture: ${why} (${DEPS}).`,
});
const banPath = (name, why) => ({ name, message: `Simple Architecture: ${why} (${DEPS}).` });

// Module patterns (import paths have no extension).
const APP = '^~/App/';
const API = '^~/api/';
const ENTITIES = '^~/entities/';
const TASKS = '(^|/)tasks/';
const HOOK = '(^|/)use[A-Z][^/]*$';
const VIEW = '(^|/)([A-Z][A-Za-z0-9]*)/\\2$'; // Folder/Folder = a component's View
const LOGIC_NOT_TASKS = '(^|/)logic/(?!tasks/)';

const REACT_AND_UI = (why) => [
  banPath('react', why),
  banPath('react-dom', why),
  banPath('react-redux', why),
];
const MANTINE = (why) => ({ group: ['@mantine/*'], message: `Simple Architecture: ${why} (${DEPS}).` });

const restrictImports = (name, files, { paths = [], patterns = [], ignores = TESTS } = {}) => ({
  name: `simple-architecture/deps-${name}`,
  files,
  ignores,
  rules: {
    'no-restricted-imports': ['error', { paths, patterns: [PARENT_IMPORTS, ...patterns] }],
  },
});

const LOW = 'a lower layer must not depend on the layers above it';

export default [
  // View → only its presenter, child components, Mantine, own types/css.
  restrictImports('view', ['src/**/*.{jsx,tsx}'], {
    ignores: ['src/main.{jsx,tsx}', ...TESTS],
    paths: [
      {
        name: 'react',
        importNames: REACT_HOOKS,
        message: `Simple Architecture: React hooks are not allowed in a View — move logic to usePresenter (see .claude/rules/sa-view-layer.md).`,
      },
      banPath('react-redux', 'a View gets everything from its presenter, not from the store'),
    ],
    patterns: [
      {
        regex: '^\\./usePresenter$',
        message:
          "Simple Architecture: the presenter lives in logic/ — import it from './logic/usePresenter' (see .claude/rules/sa-logic-folder.md).",
      },
      banRegex(ENTITIES, 'a View gets everything from its presenter, not from the store'),
      banRegex(API, 'a View never calls the server; its presenter calls a task'),
      banRegex(TASKS, 'a View never calls tasks; its presenter does'),
    ],
  }),

  // Presenter (logic/, not logic/tasks/) → tasks, store selectors, lib; not Views, not the API.
  restrictImports('presenter', ['src/**/logic/**/*.{js,ts}'], {
    ignores: ['src/**/tasks/**', ...TESTS],
    patterns: [
      banRegex(API, 'a presenter calls tasks; only tasks call the API object'),
      banRegex(VIEW, 'a presenter serves its View; it does not import Views'),
    ],
  }),

  // Task → API object, store, lib, other tasks; never presenters, hooks, Views, React or Mantine.
  restrictImports('tasks', ['src/**/tasks/**/*.{js,ts}'], {
    paths: [
      ...REACT_AND_UI('a task is independent of React; toasts and navigation belong to the presenter'),
      banPath('~/api/callApi', 'tasks call the API object — `await api.shows.search(…)`'),
    ],
    patterns: [
      MANTINE('a task is independent of the UI library'),
      banRegex(HOOK, 'a task must not depend on presenters or hooks (display depends on tasks)'),
      banRegex(VIEW, 'a task must not depend on Views (display depends on tasks)'),
      banRegex(LOGIC_NOT_TASKS, 'a task must not depend on a component’s presenter logic'),
    ],
  }),

  // Entities (the store) → RTK, ~shared, lib; nothing above.
  restrictImports('entities', ['src/entities/**/*.{js,ts}'], {
    paths: REACT_AND_UI(`${LOW}: the store knows nothing about React`),
    patterns: [
      MANTINE(LOW),
      banRegex(APP, `${LOW}: the store knows nothing about components`),
      banRegex(API, `${LOW}: the store makes no requests, tasks do`),
      banRegex(TASKS, `${LOW}: tasks use the store, not the other way round`),
    ],
  }),

  // API object → transport + contract types only.
  restrictImports('api', ['src/api/**/*.{js,ts}'], {
    paths: REACT_AND_UI(LOW),
    patterns: [banRegex(APP, LOW), banRegex(ENTITIES, LOW), banRegex(TASKS, LOW)],
  }),

  // lib/ and shared/ → nothing app-specific.
  restrictImports('lib', ['src/lib/**/*.{js,ts}', 'shared/**/*.ts'], {
    paths: REACT_AND_UI(LOW),
    patterns: [
      MANTINE(LOW),
      banRegex(APP, LOW),
      banRegex(ENTITIES, LOW),
      banRegex(API, LOW),
      banRegex(TASKS, LOW),
    ],
  }),

  // Server: index → app → routes → tasks → entities / tvmaze / lib.
  restrictImports('server-tasks', ['server/src/tasks/**/*.ts'], {
    paths: [
      ...['express', 'cors'].map((name) =>
        banPath(name, 'server tasks do not know about HTTP — that is the job of routes/'),
      ),
      {
        name: '~/tvmaze/requestTvmaze',
        importNames: ['requestTvmaze'],
        message:
          'Simple Architecture: tasks call the API object — `await tvmaze.shows.get(id)` (see .claude/rules/sa-api-layer.md).',
      },
    ],
    patterns: [banRegex('^~/routes/', 'routes call tasks, not the other way round')],
  }),
  restrictImports('server-entities', ['server/src/entities/**/*.ts', 'server/src/tvmaze/**/*.ts'], {
    paths: ['express', 'cors'].map((name) => banPath(name, `${LOW}: no HTTP here`)),
    patterns: [banRegex('^~/tasks/', LOW), banRegex('^~/routes/', LOW)],
  }),
  restrictImports('server-lib', ['server/src/lib/**/*.ts'], {
    patterns: [banRegex('^~/tasks/', LOW), banRegex('^~/routes/', LOW), banRegex('^~/entities/', LOW)],
  }),

  // No circular imports anywhere, also through several files.
  {
    name: 'simple-architecture/deps-no-cycle',
    files: ['src/**/*.{ts,tsx}', 'server/**/*.ts', 'shared/**/*.ts'],
    plugins: { 'import-x': importX },
    settings: {
      // TypeScript files are parsed for the import graph (by default import-x reads only .js).
      'import-x/extensions': importX.flatConfigs.typescript.settings['import-x/extensions'],
      'import-x/parsers': importX.flatConfigs.typescript.settings['import-x/parsers'],
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['tsconfig.app.json', 'server/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: { 'import-x/no-cycle': 'error' },
  },
];
