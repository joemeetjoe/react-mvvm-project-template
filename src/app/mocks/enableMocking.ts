import { isApiMocked } from '@/shared/lib/env';
import type { AppEnv } from '@/shared/lib/env';

import { handlers } from './handlers';

export const enableMocking = async (
  env: AppEnv = { DEV: import.meta.env.DEV, VITE_API_MOCK: import.meta.env.VITE_API_MOCK },
): Promise<void> => {
  if (!isApiMocked(env)) {
    return;
  }

  const { setupWorker } = await import('msw/browser');
  const worker = setupWorker(...handlers);

  await worker.start({ onUnhandledRequest: 'bypass' });
};
