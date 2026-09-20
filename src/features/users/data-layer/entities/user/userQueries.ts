import { queryOptions } from '@tanstack/react-query';

import { fetchUserDetail, fetchUserList } from './userApi';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const userListQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.lists(),
    queryFn: fetchUserList,
  });

export const userDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserDetail(id),
  });
