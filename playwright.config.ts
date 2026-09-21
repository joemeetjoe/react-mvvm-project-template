import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests run against the Vite dev server with `VITE_API_MOCK=true`, the
 * same way a developer runs the app locally (see README Quick start). The
 * app only starts its MSW worker when `import.meta.env.DEV` is true (decision
 * in `src/app/mocks/enableMocking.ts`), so a production build + `preview`
 * would serve no mock data without changing that gate — out of scope here.
 */
const port = 5183;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_MOCK: 'true' },
  },
});
