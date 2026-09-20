import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { RouteErrorBoundary } from '@/infrastructure/routing/RouteErrorBoundary';
import { protectedLayoutRoute } from '@/infrastructure/routing/layoutRoutes';

import { userSortFields } from '../data-layer/entities/user/userSchema';
import { userListQueryOptions } from '../data-layer/entities/user/userQueries';
import { UserList } from '../screens/UserList';
import { UserListSkeleton } from '../screens/UserList/UserListSkeleton';

export const userListPageSizes = [10, 20, 50] as const;

// List state lives in URL search params (decision 4). Anything invalid falls
// back to the default instead of erroring, so a bad or stale link still works.
export const userListSearchSchema = z.object({
  sort: z.enum(userSortFields).catch('firstName'),
  direction: z.enum(['asc', 'desc']).catch('asc'),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((size) => (userListPageSizes as readonly number[]).includes(size))
    .catch(10),
});

export const userListRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'users',
  validateSearch: userListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }): Promise<void> => {
    await context.queryClient.ensureQueryData(userListQueryOptions(deps));
  },
  // Show the skeleton as soon as the loader is in flight rather than after the
  // router's default 1s grace period.
  pendingMs: 0,
  component: UserList,
  pendingComponent: UserListSkeleton,
  errorComponent: RouteErrorBoundary,
});
