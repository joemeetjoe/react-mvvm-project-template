import { createRoute } from '@tanstack/react-router';

import { RouteErrorBoundary } from '@/infrastructure/routing/RouteErrorBoundary';
import { protectedLayoutRoute } from '@/infrastructure/routing/layoutRoutes';

import { userDetailQueryOptions } from '../data-layer/entities/user/userQueries';
import { UserDetail } from '../screens/UserDetail';
import { UserDetailSkeleton } from '../screens/UserDetail/UserDetailSkeleton';

export const userDetailRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'users/$userId',
  loader: async ({ context, params }): Promise<void> => {
    await context.queryClient.ensureQueryData(userDetailQueryOptions(params.userId));
  },
  // Show the skeleton as soon as the loader is in flight rather than after the
  // router's default 1s grace period.
  pendingMs: 0,
  component: UserDetail,
  pendingComponent: UserDetailSkeleton,
  errorComponent: RouteErrorBoundary,
});
