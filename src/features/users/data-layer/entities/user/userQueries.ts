import { type QueryClient, type UseMutationOptions, queryOptions } from '@tanstack/react-query';

import { type UserListParams, fetchUserDetail, fetchUserList, updateUser } from './userApi';
import type { User, UserUpdate } from './userSchema';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userListQueryOptions = (params: UserListParams) =>
  queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUserList(params),
  });

export const userDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserDetail(id),
  });

export type UserUpdateContext = { previousUser: User | undefined };

/**
 * Owns the cache work for editing a user (decision 8): applies the update to
 * the cached detail optimistically, rolls it back if the request fails, and
 * invalidates the detail and list queries once the mutation settles either way.
 */
export const userUpdateMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions<User, Error, UserUpdate, UserUpdateContext> => ({
  mutationFn: (update) => updateUser(id, update),
  onMutate: async (update) => {
    await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

    const previousUser = queryClient.getQueryData<User>(userKeys.detail(id));

    if (previousUser) {
      queryClient.setQueryData<User>(userKeys.detail(id), { ...previousUser, ...update });
    }

    return { previousUser };
  },
  onError: (_error, _update, context) => {
    if (context?.previousUser) {
      queryClient.setQueryData(userKeys.detail(id), context.previousUser);
    }
  },
  onSettled: () => {
    void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  },
});
