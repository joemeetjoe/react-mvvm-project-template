import { describe, expect, it } from 'vitest';

import { isApiMocked } from './env';

describe('isApiMocked', () => {
  it('is false outside of development, even with the flag on', () => {
    expect(isApiMocked({ DEV: false, VITE_API_MOCK: 'true' })).toBe(false);
  });

  it('is false in development when the flag is unset', () => {
    expect(isApiMocked({ DEV: true, VITE_API_MOCK: undefined })).toBe(false);
  });

  it('is false in development when the flag is not exactly "true"', () => {
    expect(isApiMocked({ DEV: true, VITE_API_MOCK: '1' })).toBe(false);
  });

  it('is true in development when the flag is "true"', () => {
    expect(isApiMocked({ DEV: true, VITE_API_MOCK: 'true' })).toBe(true);
  });
});
