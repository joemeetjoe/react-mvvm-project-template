import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { RouteErrorBoundary } from '@/shared/routing/RouteErrorBoundary';

import {
  userListFilterSchema,
  userListPageSizes,
  userSortFields,
} from '../data-layer/entities/user/userSchema';
import {
  userFilterOptionsQueryOptions,
  userListQueryOptions,
} from '../data-layer/entities/user/userQueries';
import { UserList } from '../screens/UserList';
import { UserListSkeleton } from '../screens/UserList/UserListSkeleton';

// List state lives in URL search params. Anything invalid falls
// back to the default instead of erroring, so a bad or stale link still works.
export const userListSearchSchema = z
  .object({
    sort: z.enum(userSortFields).catch('firstName'),
    direction: z.enum(['asc', 'desc']).catch('asc'),
    page: z.coerce.number().int().min(1).catch(1),
    pageSize: z.coerce
      .number()
      .int()
      .refine((size) => (userListPageSizes as readonly number[]).includes(size))
      .catch(10),
  })
  .merge(userListFilterSchema);

// A function wrapper (rather than passing the zod object directly) so the
// ViewModel test's host router (`shared/testing/render`) can reuse the exact
// same validation the real route performs.
export const validateUserListSearch = (search: Record<string, unknown>) =>
  userListSearchSchema.parse(search);

export const createUserListRoute = <TParentRoute extends AnyRoute>(parentRoute: TParentRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: 'users',
    validateSearch: validateUserListSearch,
    loaderDeps: ({ search }) => search,
    loader: async ({ context, deps }): Promise<void> => {
      await Promise.all([
        context.queryClient.ensureQueryData(userListQueryOptions(deps)),
        context.queryClient.ensureQueryData(userFilterOptionsQueryOptions()),
      ]);
    },
    // Show the skeleton as soon as the loader is in flight rather than after
    // the router's default 1s grace period.
    pendingMs: 0,
    component: UserList,
    pendingComponent: UserListSkeleton,
    errorComponent: RouteErrorBoundary,
  });
