import { createRouter } from '@tanstack/react-router';

import { createUserListRoute } from '@/features/users/routes/userListRoute';
import { createUserDetailRoute } from '@/features/users/routes/userDetailRoute';
import { createLoginRoute } from '@/features/auth/routes/loginRoute';
import { createLoginFailedRoute } from '@/features/auth/routes/loginFailedRoute';
// plop:route-import

import {
  protectedLayoutRoute,
  authLayoutRoute,
  mainLayoutRoute,
  rootRoute,
} from './layoutRoutes';
import type { RouterContext } from './routerContext';

export type { RouterContext };

export const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    protectedLayoutRoute.addChildren([
      createUserListRoute(protectedLayoutRoute),
      createUserDetailRoute(protectedLayoutRoute),
      // Add new feature routes here
    ]),
  ]),
  authLayoutRoute.addChildren([
    createLoginRoute(authLayoutRoute),
    createLoginFailedRoute(authLayoutRoute),
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
