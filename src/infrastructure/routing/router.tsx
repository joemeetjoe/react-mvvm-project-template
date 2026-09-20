import { createRouter } from '@tanstack/react-router';
import { homeRoute } from './homeRoute';
import { protectedLayoutRoute, authLayoutRoute, mainLayoutRoute, rootRoute } from './layoutRoutes';
import { usersListRoute } from '@/features/users/routes/listRoute';
import { usersDetailRoute } from '@/features/users/routes/detailRoute';
import { loginFailedRoute } from './authRoutes';
import type { RouterContext } from './routerContext';

export type { RouterContext };

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
