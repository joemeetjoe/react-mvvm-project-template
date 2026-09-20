import { createRouter } from '@tanstack/react-router';
import { protectedLayoutRoute, authLayoutRoute, mainLayoutRoute, rootRoute } from './layoutRoutes';
import { userListRoute } from '@/features/users/routes/userListRoute';
import { usersDetailRoute } from '@/features/users/routes/detailRoute';
import { loginRoute } from '@/features/auth/routes/loginRoute';
import { loginFailedRoute } from '@/features/auth/routes/loginFailedRoute';
import type { RouterContext } from './routerContext';

export type { RouterContext };

export const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    protectedLayoutRoute.addChildren([
      userListRoute,
      usersDetailRoute,
      // Add new feature routes here
    ]),
  ]),
  authLayoutRoute.addChildren([
    loginRoute,
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
