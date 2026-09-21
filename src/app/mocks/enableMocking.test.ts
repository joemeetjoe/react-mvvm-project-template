import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn().mockResolvedValue(undefined);
const setupWorker = vi.fn().mockReturnValue({ start });

vi.mock('msw/browser', () => ({ setupWorker }));

import { enableMocking, shouldEnableMocking } from './enableMocking';

describe('shouldEnableMocking', () => {
  it('is false outside of development, even with the flag on', () => {
    expect(shouldEnableMocking({ DEV: false, VITE_API_MOCK: 'true' })).toBe(false);
  });

  it('is false in development when the flag is unset', () => {
    expect(shouldEnableMocking({ DEV: true, VITE_API_MOCK: undefined })).toBe(false);
  });

  it('is false in development when the flag is not exactly "true"', () => {
    expect(shouldEnableMocking({ DEV: true, VITE_API_MOCK: '1' })).toBe(false);
  });

  it('is true in development when the flag is "true"', () => {
    expect(shouldEnableMocking({ DEV: true, VITE_API_MOCK: 'true' })).toBe(true);
  });
});

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
