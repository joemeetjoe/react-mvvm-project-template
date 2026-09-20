import { createRoute } from '@tanstack/react-router';

import { RouteErrorBoundary } from '@/infrastructure/routing/RouteErrorBoundary';
import { protectedLayoutRoute } from '@/infrastructure/routing/layoutRoutes';

import { userListQueryOptions } from '../data-layer/entities/user/userQueries';
import { UserList } from '../screens/UserList';
import { UserListSkeleton } from '../screens/UserList/UserListSkeleton';

export const userListRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'users',
  loader: async ({ context }): Promise<void> => {
    await context.queryClient.ensureQueryData(userListQueryOptions());
  },
  // Show the skeleton as soon as the loader is in flight rather than after the
  // router's default 1s grace period.
  pendingMs: 0,
  component: UserList,
  pendingComponent: UserListSkeleton,
  errorComponent: RouteErrorBoundary,
});
