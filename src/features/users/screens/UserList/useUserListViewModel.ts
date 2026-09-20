import { useSuspenseQuery } from '@tanstack/react-query';

import { userListQueryOptions } from '../../data-layer/entities/user/userQueries';
import type { UserListViewProps } from './UserListView';

export const useUserListViewModel = (): UserListViewProps => {
  const { data: users } = useSuspenseQuery(userListQueryOptions());

  return { users };
};
