// Simple Architecture ESLint rules (flat config).
// Usage in eslint.config.js:
//   import simpleArchitecture from './eslint/simple-architecture.js';
//   export default [...otherConfigs, ...simpleArchitecture];
// Rules: .claude/rules/sa-file-size-120.md, sa-view-layer.md, sa-presenter-layer.md, sa-imports.md

const VIEW_HINT =
  'Simple Architecture: move logic to usePresenter (see .claude/rules/sa-view-layer.md).';

const PROPS_HINT =
  'Simple Architecture: take props whole as `props: <Name>Props` and pass them on as usePresenter(props) (see .claude/rules/sa-presenter-layer.md).';

// Own folder and own children: './…'. Anything further up: '@/…' (see .claude/rules/sa-imports.md).
const PARENT_IMPORTS = {
  regex: '^\\.\\./',
  message:
    "Simple Architecture: import from outside the own folder via '@/…' (see .claude/rules/sa-imports.md).",
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

export default [
  {
    name: 'simple-architecture/imports',
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [PARENT_IMPORTS] }],
    },
  },
  {
    name: 'simple-architecture/presenter-props',
    files: ['src/**/usePresenter.{js,ts}'],
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
    files: ['src/**/*.{js,jsx,ts,tsx}'],
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
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: REACT_HOOKS,
              message: `React hooks are not allowed in a View. ${VIEW_HINT}`,
            },
          ],
          // Repeated here: this config replaces 'simple-architecture/imports' for View files.
          patterns: [PARENT_IMPORTS],
        },
      ],
    },
  },
];
