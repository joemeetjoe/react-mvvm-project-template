import { useMutation } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { useSessionStore } from '@/shared/stores/sessionStore';
import { renderHook, waitFor } from '@/shared/testing/render';

import { sessionFixtures } from './sessionFixtures';
import { sessionMutations } from './sessionQueries';

describe('sessionMutations.login', () => {
  it('writes the returned session into the shared session store on success', async () => {
    const { result } = renderHook(() => useMutation(sessionMutations.login()), { session: null });

    await waitFor(() => expect(result.current).not.toBeNull());

    result.current?.mutate({ email: 'admin@example.com', password: 'anything' });

    await waitFor(() => {
      expect(useSessionStore.getState()).toMatchObject({
        user: sessionFixtures[0].user,
        token: sessionFixtures[0].token,
      });
    });
  });

  it('does not touch the session store when login fails', async () => {
    const { result } = renderHook(() => useMutation(sessionMutations.login()), { session: null });

    await waitFor(() => expect(result.current).not.toBeNull());

    result.current?.mutate({ email: 'nobody@example.com', password: 'anything' });

    await waitFor(() => {
      expect(result.current?.isError).toBe(true);
    });

    expect(useSessionStore.getState()).toMatchObject({ user: null, token: null });
  });
});
