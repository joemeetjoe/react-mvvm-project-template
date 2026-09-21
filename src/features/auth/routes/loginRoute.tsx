import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { Login } from '../screens/Login';

export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export type LoginSearch = z.infer<typeof loginSearchSchema>;

/** Parent injected by `app/router` — see `createUserListRoute`. */
export const createLoginRoute = <TParentRoute extends AnyRoute>(parentRoute: TParentRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: '/',
    validateSearch: loginSearchSchema,
    component: Login,
  });
