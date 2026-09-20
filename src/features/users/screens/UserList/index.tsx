import type { ReactElement } from 'react';

import { UserListView } from './UserListView';
import { useUserListViewModel } from './useUserListViewModel';

export const UserList = (): ReactElement => {
  const props = useUserListViewModel();

  return <UserListView {...props} />;
};
