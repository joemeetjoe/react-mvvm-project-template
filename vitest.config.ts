import path from 'path';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appTier = { lines: 80, functions: 80, branches: 80, statements: 80 };
const featureTier = { lines: 80, functions: 80, branches: 80, statements: 80 };
const dataLayerTier = { lines: 100, functions: 100, branches: 100, statements: 100 };
const sharedComponentTier = { lines: 90, functions: 90, branches: 90, statements: 90 };

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // Playwright owns e2e/ (npm run test:e2e); belt-and-suspenders alongside
    // the include glob above so Vitest never picks up its .spec.ts files.
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/shared/testing/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        // shadcn output, left exactly as generated and never measured.
        'src/shared/ui/**',
        // The dev-only entry point: it boots the MSW worker and mounts React,
        // neither of which a jsdom test runs.
        'src/app/main.tsx',
      ],
      thresholds: {
        'src/app/**': appTier,
        'src/features/**': featureTier,
        'src/features/*/data-layer/**': dataLayerTier,
        'src/shared/components/**': sharedComponentTier,
        'src/shared/hooks/**': sharedComponentTier,
        'src/shared/routing/**': sharedComponentTier,
        'src/shared/lib/**': dataLayerTier,
        'src/shared/utils/**': dataLayerTier,
        'src/shared/stores/**': dataLayerTier,
        // `shared/testing` is still measured, but it is the harness rather than
        // product code: its browser stubs branch on environments jsdom never
        // reaches, so it carries no threshold of its own.
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
