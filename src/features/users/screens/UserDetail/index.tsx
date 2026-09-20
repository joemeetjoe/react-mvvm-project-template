import type { ReactElement } from 'react';
import { useParams } from '@tanstack/react-router';

import { UserDetailView } from './UserDetailView';
import { useUserDetailViewModel } from './useUserDetailViewModel';

export const UserDetail = (): ReactElement => {
  const { userId } = useParams({ from: '/users/$userId' });
  const props = useUserDetailViewModel(userId);

  return <UserDetailView {...props} />;
};
