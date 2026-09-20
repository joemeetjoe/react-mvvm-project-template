import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';

const viewRuleMessage =
  'A View has no external dependencies (decision 7). Move this to the ViewModel and pass the result in as a prop.';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
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
        // TEMPORARY: code that has not been migrated yet. The demolition slice
        // removes this element type and every rule that allows importing it.
        { type: 'legacy', pattern: ['src/infrastructure/*', 'src/testing/*'], mode: 'folder' },
        { type: 'legacy', pattern: ['src/App.tsx', 'src/main.tsx'], mode: 'file' },
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
              allow: ['app', 'feature', 'shared', 'testing', 'legacy'],
            },
            {
              from: 'feature',
              allow: [
                ['feature', { feature: '${from.feature}' }],
                'shared',
                'testing',
                'legacy',
              ],
              message:
                'A feature may only import itself, shared and (temporarily) legacy — never another feature.',
            },
            {
              // TEMPORARY: `legacy` is here only because the shadcn primitives
              // in shared/ui still import @/infrastructure/lib/utils.
              from: 'shared',
              allow: ['shared', 'legacy'],
              message: 'shared may only import shared.',
            },
            {
              // Test infrastructure aggregates every feature's MSW handlers and
              // renders the real route tree, so it reaches everywhere.
              from: 'testing',
              allow: ['testing', 'shared', 'feature', 'legacy'],
            },
            {
              from: 'legacy',
              allow: ['legacy', 'shared', 'feature'],
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
);
