import { handlers } from './handlers';

export type MockEnv = {
  DEV: boolean;
  VITE_API_MOCK?: string;
};

export const shouldEnableMocking = (env: MockEnv): boolean =>
  env.DEV && env.VITE_API_MOCK === 'true';

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
