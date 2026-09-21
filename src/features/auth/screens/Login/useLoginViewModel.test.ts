import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';

import { useLoginViewModel } from './useLoginViewModel';

describe('useLoginViewModel', () => {
  it('prefills the demo credentials and starts idle', async () => {
    const { result } = renderHook(() => useLoginViewModel());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        email: 'admin@example.com',
        password: 'password',
        isSubmitting: false,
      });
    });
  });
});
