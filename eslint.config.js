import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';

const viewRuleMessage =
  'A View has no external dependencies (decision 7). Move this to the ViewModel and pass the result in as a prop.';

export default tseslint.config(
  // `npm run lint` only ever targets `src/`; `e2e/` is Playwright's own tree
  // (not part of the `src/` import boundaries) and is ignored here too so an
  // IDE running ESLint workspace-wide doesn't flag it against those rules.
  { ignores: ['dist', 'node_modules', 'coverage', 'e2e', 'playwright-report', 'test-results'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
      // Listed most specific first: the first matching element wins.
      'boundaries/elements': [
        { type: 'testing', pattern: 'src/shared/testing', mode: 'folder' },
        { type: 'shared', pattern: 'src/shared/*', mode: 'folder' },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['feature'] },
        { type: 'app', pattern: 'src/app/*', mode: 'folder' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',

      // Decision 10: the custom renderer is the only way into Testing Library.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@testing-library/react',
              message:
                'Import the custom renderer from @/shared/testing/render instead of @testing-library/react.',
            },
            {
              name: '@testing-library/user-event',
              message:
                'The custom renderer from @/shared/testing/render already returns a `user`.',
            },
          ],
        },
      ],

      // Decision 6: app -> features -> shared, and no feature-to-feature imports.
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: ['app', 'feature', 'shared', 'testing'],
            },
            {
              from: 'feature',
              allow: [['feature', { feature: '${from.feature}' }], 'shared', 'testing'],
              message: 'A feature may only import itself and shared — never another feature.',
            },
            {
              from: 'shared',
              allow: ['shared'],
              message: 'shared may only import shared.',
            },
            {
              // Test infrastructure aggregates every feature's MSW handlers and
              // renders the real route tree (built in app/router), so it
              // reaches everywhere.
              from: 'testing',
              allow: ['testing', 'shared', 'feature', 'app'],
            },
          ],
        },
      ],
    },
  },
  {
    // Decision 7: a View has no external dependencies.
    files: ['src/**/*View.tsx', 'src/shared/components/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@tanstack/react-query', message: viewRuleMessage },
            { name: '@tanstack/react-query-devtools', message: viewRuleMessage },
            { name: 'zustand', message: viewRuleMessage },
            { name: 'zustand/react/shallow', message: viewRuleMessage },
            {
              name: '@tanstack/react-router',
              allowImportNames: ['Link'],
              message: `${viewRuleMessage} Only <Link> may be imported from the router.`,
            },
          ],
          patterns: [
            {
              group: ['**/data-layer/**'],
              allowTypeImports: true,
              message: `${viewRuleMessage} Only \`import type\` is allowed from the data-layer.`,
            },
            {
              group: ['**/use*ViewModel', '**/use*ViewModel.*'],
              message: `${viewRuleMessage} The screen's index.tsx calls the ViewModel, not the View.`,
            },
            {
              group: ['**/stores/*', '**/stores/**'],
              message: `${viewRuleMessage} Store state reaches a View as a prop.`,
            },
          ],
        },
      ],
    },
  },
  {
    // The one place allowed to import Testing Library.
    files: ['src/shared/testing/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Shared code's own tests (e.g. the http wrapper) reach the custom renderer
    // and the MSW test server the same way feature tests do (decision 10).
    files: ['src/shared/**/*.test.{ts,tsx}'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [{ from: 'shared', allow: ['shared', 'testing'] }],
        },
      ],
    },
  },
);
