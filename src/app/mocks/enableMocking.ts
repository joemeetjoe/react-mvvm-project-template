import { handlers } from './handlers';

export type MockEnv = {
  DEV: boolean;
  VITE_API_MOCK?: string;
};

/**
 * The MSW browser worker only ever starts in development, and only when
 * explicitly opted into — a real API base URL is used otherwise.
 */
export const shouldEnableMocking = (env: MockEnv): boolean =>
  env.DEV && env.VITE_API_MOCK === 'true';

/**
 * Starts the MSW browser worker against the same handlers the tests use,
 * colocated per entity in each feature's data-layer. Does nothing — and
 * never imports `msw/browser` — unless mocking is enabled, so no worker is
 * registered in production or when the flag is off.
 */
export const enableMocking = async (
  env: MockEnv = { DEV: import.meta.env.DEV, VITE_API_MOCK: import.meta.env.VITE_API_MOCK },
): Promise<void> => {
  if (!shouldEnableMocking(env)) {
    return;
  }

  const { setupWorker } = await import('msw/browser');
  const worker = setupWorker(...handlers);

  await worker.start({ onUnhandledRequest: 'bypass' });
};
