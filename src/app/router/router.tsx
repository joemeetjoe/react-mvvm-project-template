import { createRouter } from '@tanstack/react-router';
import {
  protectedLayoutRoute,
  authLayoutRoute,
  mainLayoutRoute,
  rootRoute,
} from '@/infrastructure/routing/layoutRoutes';
import { userListRoute } from '@/features/users/routes/userListRoute';
import { userDetailRoute } from '@/features/users/routes/userDetailRoute';
import { loginRoute } from '@/features/auth/routes/loginRoute';
import { loginFailedRoute } from '@/features/auth/routes/loginFailedRoute';
import type { RouterContext } from './routerContext';

export type { RouterContext };

export const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    protectedLayoutRoute.addChildren([
      userListRoute,
      userDetailRoute,
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
