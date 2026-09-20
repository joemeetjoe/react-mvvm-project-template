import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';

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
      'boundaries/elements': [
        { type: 'view', pattern: 'src/features/*/view/*' },
        { type: 'vm', pattern: 'src/features/*/vm/*' },
        { type: 'model', pattern: 'src/features/*/model/*' },
        { type: 'routes', pattern: 'src/features/*/routes/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/*' },
        { type: 'shared', pattern: 'src/shared/*' },
        { type: 'testing', pattern: 'src/testing/*' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // MVVM boundary rules - enforced at ERROR level
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // View can import from: VM, Infrastructure, Shared, own feature model (for types only)
            {
              from: 'view',
              allow: ['vm', 'infrastructure', 'shared'],
              message: 'View layer must not import from Model directly. Use VM instead.',
            },
            // VM can import from: Model, Infrastructure, Shared
            {
              from: 'vm',
              allow: ['model', 'infrastructure', 'shared'],
              message: 'VM layer must not import from View.',
            },
            // Model can import from: Infrastructure, Shared only
            {
              from: 'model',
              allow: ['infrastructure', 'shared'],
              message: 'Model layer must not import from VM or View.',
            },
            // Routes can import from: View, VM (to wire them together)
            {
              from: 'routes',
              allow: ['view', 'vm', 'infrastructure', 'shared'],
            },
            // Infrastructure can import from: Infrastructure, Shared
            {
              from: 'infrastructure',
              allow: ['infrastructure', 'shared'],
            },
            // Shared can import from: Shared only
            {
              from: 'shared',
              allow: ['shared'],
            },
            // Testing can import from anywhere
            {
              from: 'testing',
              allow: ['view', 'vm', 'model', 'routes', 'infrastructure', 'shared', 'testing'],
            },
          ],
        },
      ],

      // Zero-hooks enforcement in View layer
      'react-hooks/rules-of-hooks': 'error',
    },
  },
);
