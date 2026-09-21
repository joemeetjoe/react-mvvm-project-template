import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * A separate config for the `new-feature` generator's acceptance test
 * (`npm run test:scaffolder`). It shells out to a real `tsc -b --force` and a
 * real `vitest run`, which is too slow to run under jsdom inside the main
 * `npm run validate` / `npm run test:coverage` suite — see CONTRIBUTING.md.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/scaffolder/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
