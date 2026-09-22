import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';

import { useLoginViewModel } from './useLoginViewModel';

describe('useLoginViewModel', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts with empty credentials and no hint when the API is not mocked', async () => {
    vi.stubEnv('VITE_API_MOCK', 'false');

    const { result } = renderHook(() => useLoginViewModel());

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.form.state.values).toEqual({ email: '', password: '' });
    expect(result.current?.hint).toBeUndefined();
    expect(result.current?.isSubmitting).toBe(false);
  });

  it('prefills the demo credentials and shows the hint when the API is mocked', async () => {
    vi.stubEnv('VITE_API_MOCK', 'true');

    const { result } = renderHook(() => useLoginViewModel());

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.form.state.values).toEqual({
      email: 'admin@example.com',
      password: 'password',
    });
    expect(result.current?.hint).toMatch(/admin@example.com/);
    expect(result.current?.isSubmitting).toBe(false);
  });
});
