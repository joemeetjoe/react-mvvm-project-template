import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn().mockResolvedValue(undefined);
const setupWorker = vi.fn().mockReturnValue({ start });

vi.mock('msw/browser', () => ({ setupWorker }));

import { enableMocking } from './enableMocking';

describe('enableMocking', () => {
  beforeEach(() => {
    setupWorker.mockClear();
    start.mockClear();
  });

  it('never starts the worker when mocking should be off', async () => {
    await enableMocking({ DEV: true, VITE_API_MOCK: undefined });

    expect(setupWorker).not.toHaveBeenCalled();
  });

  it('starts the browser worker, bypassing unhandled requests, when mocking is on', async () => {
    await enableMocking({ DEV: true, VITE_API_MOCK: 'true' });

    expect(setupWorker).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
  });
});
