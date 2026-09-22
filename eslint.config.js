import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import { plugin as shadcn } from '@shadcn/lint';

const viewRuleMessage =
  'A View has no external dependencies. Move this to the ViewModel and pass the result in as a prop.';

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

      // The custom renderer is the only way into Testing Library.
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

      // app -> features -> shared, and no feature-to-feature imports.
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
    // A View has no external dependencies.
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
    // All visual styling lives in the shadcn components under shared/ui.
    // Everything else may only use Tailwind for layout and positioning.
    // Components and theme are discovered automatically via components.json.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { shadcn },
    rules: {
      'shadcn/no-restyle': ['error', { allow: ['layout'] }],
      'shadcn/no-raw-colors': 'error',
      'shadcn/no-arbitrary-values': ['error', { allow: ['layout'] }],
      'shadcn/no-inline-styles': 'error',
      'shadcn/no-unknown-classes': 'error',
      'shadcn/require-static-classes': 'error',
    },
  },
  {
    // shadcn-generated files are the one place styling is defined, so the
    // restyle/arbitrary/static rules do not apply to them (per the plugin's
    // adoption guide). Raw colors and inline styles stay banned.
    files: ['src/shared/ui/**'],
    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'off',
      'shadcn/require-static-classes': 'off',
    },
  },
  {
    // shadcn's generated Toaster uses a bare `toaster` marker class as the
    // hook for its `group-[.toaster]:` styles. It is intentional, not a typo.
    files: ['src/shared/ui/sonner.tsx'],
    rules: {
      'shadcn/no-unknown-classes': 'off',
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
    // Shared code's own tests reach the custom renderer and the MSW test server the same way feature tests do.
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
