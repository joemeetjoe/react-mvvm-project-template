import { queryOptions } from '@tanstack/react-query';

import { type UserListParams, fetchUserDetail, fetchUserList } from './userApi';

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
