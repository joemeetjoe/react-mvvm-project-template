import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { LoginFailed } from '../screens/LoginFailed';

export const loginFailedSearchSchema = z.object({
  redirect: z.string().optional(),
});

export type LoginFailedSearch = z.infer<typeof loginFailedSearchSchema>;

/** Parent injected by `app/router` — see `createUserListRoute`. */
export const createLoginFailedRoute = <TParentRoute extends AnyRoute>(parentRoute: TParentRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: 'login-failed',
    validateSearch: loginFailedSearchSchema,
    component: LoginFailed,
  });
