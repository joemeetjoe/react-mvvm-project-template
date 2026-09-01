import { createRouter } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { homeRoute } from './homeRoute';
import { protectedLayoutRoute, authLayoutRoute, mainLayoutRoute, rootRoute } from './layoutRoutes';
import { usersListRoute } from '@/features/users/routes/listRoute';
import { usersDetailRoute } from '@/features/users/routes/detailRoute';
import { loginFailedRoute } from './authRoutes';

export interface RouterContext {
  queryClient: QueryClient;
}

export const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    protectedLayoutRoute.addChildren([
      usersListRoute,
      usersDetailRoute,
      // Add new feature routes here
    ]),
  ]),
  authLayoutRoute.addChildren([
    homeRoute,
    loginFailedRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    queryClient: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
