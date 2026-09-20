import { queryOptions } from '@tanstack/react-query';

import { fetchUserList } from './userApi';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
};

export const userListQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.lists(),
    queryFn: fetchUserList,
  });
