import { queryOptions } from '@tanstack/react-query';

import { type UserListParams, fetchUserList } from './userApi';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
};

export const userListQueryOptions = (params: UserListParams) =>
  queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUserList(params),
  });
