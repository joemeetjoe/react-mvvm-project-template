import type { ReactElement } from 'react';
import { useParams } from '@tanstack/react-router';

import { UserDetailView } from './UserDetailView';
import { useUserDetailViewModel } from './useUserDetailViewModel';

export const UserDetail = (): ReactElement => {
  // `strict: false` (rather than a `from` route id) keeps this screen decoupled
  // from the pathless layout routes it happens to be nested under.
  const { userId } = useParams({ strict: false });
  const props = useUserDetailViewModel(userId as string);

  return <UserDetailView {...props} />;
};
