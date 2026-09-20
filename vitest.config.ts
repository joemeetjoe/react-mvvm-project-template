import path from 'path';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const featureTier = { lines: 80, functions: 80, branches: 80, statements: 80 };
const dataLayerTier = { lines: 100, functions: 100, branches: 100, statements: 100 };
const sharedComponentTier = { lines: 90, functions: 90, branches: 90, statements: 90 };

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/shared/testing/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // TEMPORARY (decision 12): coverage is measured on the migrated paths
      // only. The demolition slice widens this to all of `src`.
      include: [
        'src/features/*/screens/**/*.{ts,tsx}',
        'src/features/*/components/**/*.{ts,tsx}',
        'src/features/*/routes/**/*.{ts,tsx}',
        'src/features/*/data-layer/**/*.{ts,tsx}',
        'src/shared/components/**/*.{ts,tsx}',
        'src/shared/hooks/**/*.{ts,tsx}',
        'src/shared/lib/**/*.ts',
        'src/shared/utils/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        // Not migrated yet; the user detail slice brings this in.
        'src/features/*/routes/detailRoute.tsx',
      ],
      // Tiered per decision 10. shadcn (`src/shared/ui`) is never measured.
      thresholds: {
        'src/features/*/screens/**': featureTier,
        'src/features/*/components/**': featureTier,
        'src/features/*/routes/**': featureTier,
        'src/features/*/data-layer/**': dataLayerTier,
        'src/shared/components/**': sharedComponentTier,
        'src/shared/hooks/**': sharedComponentTier,
        'src/shared/lib/**': dataLayerTier,
        'src/shared/utils/**': dataLayerTier,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
