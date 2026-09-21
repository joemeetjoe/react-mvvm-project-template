import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { authLayoutRoute } from '@/infrastructure/routing/layoutRoutes';

import { LoginFailed } from '../screens/LoginFailed';

export const loginFailedSearchSchema = z.object({
  redirect: z.string().optional(),
});

export type LoginFailedSearch = z.infer<typeof loginFailedSearchSchema>;

export const loginFailedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'login-failed',
  validateSearch: loginFailedSearchSchema,
  component: LoginFailed,
});
