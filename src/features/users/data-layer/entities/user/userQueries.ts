import { queryOptions } from '@tanstack/react-query';

import { fetchUserList } from './userApi';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
};

export const userListQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.lists(),
    queryFn: fetchUserList,
  });
