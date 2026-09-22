import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook, waitFor } from '@/shared/testing/render';
import { server } from '@/shared/testing/server';

import { userFixtures } from './userFixtures';
import { resetUserFixtures } from './userHandlers';
import { userDetailQueryOptions, userKeys, userUpdateMutationOptions } from './userQueries';

const useTestUserUpdateMutation = (id: string) => {
  const queryClient = useQueryClient();
  const detailQuery = useQuery(userDetailQueryOptions(id));
  const mutation = useMutation(userUpdateMutationOptions(queryClient, id));

  return { detailQuery, mutation };
};

/** No `useQuery` observer, so the detail key starts out uncached. */
const useMutationOnly = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation(userUpdateMutationOptions(queryClient, id));
};

describe('userUpdateMutationOptions', () => {
  afterEach(() => {
    resetUserFixtures();
  });

  it('optimistically applies the update to the cached detail before the request resolves', async () => {
    const [user] = userFixtures;

    const { result, queryClient } = renderHook(() => useTestUserUpdateMutation(user.id));

    await waitFor(() => {
      expect(result.current?.detailQuery.data).toEqual(user);
    });

    act(() => {
      result.current?.mutation.mutate({ ...user, firstName: 'Changed' });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(userKeys.detail(user.id))).toMatchObject({
        firstName: 'Changed',
      });
    });

    await waitFor(() => {
      expect(result.current?.mutation.isSuccess).toBe(true);
    });
  });

  it('rolls back the cached detail when the request fails', async () => {
    const [user] = userFixtures;

    const { result, queryClient } = renderHook(() => useTestUserUpdateMutation(user.id));

    await waitFor(() => {
      expect(result.current?.detailQuery.data).toEqual(user);
    });

    server.use(http.patch('*/api/users/:id', () => new HttpResponse(null, { status: 500 })));

    act(() => {
      result.current?.mutation.mutate({ ...user, firstName: 'Changed' });
    });

    await waitFor(() => {
      expect(result.current?.mutation.isError).toBe(true);
    });

    expect(queryClient.getQueryData(userKeys.detail(user.id))).toEqual(user);
  });

  it('invalidates the detail and list queries once the mutation settles', async () => {
    const [user] = userFixtures;

    const { result, queryClient } = renderHook(() => useTestUserUpdateMutation(user.id));

    await waitFor(() => {
      expect(result.current?.detailQuery.data).toEqual(user);
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => {
      result.current?.mutation.mutate({ ...user, firstName: 'Changed' });
    });

    await waitFor(() => {
      expect(result.current?.mutation.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userKeys.detail(user.id) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: userKeys.lists() });
  });

  it('succeeds without touching the cache when there is no prior detail cached', async () => {
    const [user] = userFixtures;

    const { result } = renderHook(() => useMutationOnly(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.mutate({ ...user, firstName: 'Changed' });
    });

    await waitFor(() => {
      expect(result.current?.isSuccess).toBe(true);
    });
  });

  it('does not throw rolling back a failed mutation with no prior detail cached', async () => {
    const [user] = userFixtures;

    server.use(http.patch('*/api/users/:id', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useMutationOnly(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.mutate({ ...user, firstName: 'Changed' });
    });

    await waitFor(() => {
      expect(result.current?.isError).toBe(true);
    });
  });
});
