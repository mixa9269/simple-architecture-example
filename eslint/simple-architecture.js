// Simple Architecture ESLint rules (flat config).
// Usage in eslint.config.js:
//   import simpleArchitecture from './eslint/simple-architecture.js';
//   export default [...otherConfigs, ...simpleArchitecture];
// Rules: .claude/rules/sa-file-size-120.md, .claude/rules/sa-view-layer.md

const VIEW_HINT =
  'Simple Architecture: move logic to usePresenter (see .claude/rules/sa-view-layer.md).';

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
        },
      ],
    },
  },
];
