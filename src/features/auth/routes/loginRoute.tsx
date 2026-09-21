import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { authLayoutRoute } from '@/infrastructure/routing/layoutRoutes';

import { Login } from '../screens/Login';

export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export type LoginSearch = z.infer<typeof loginSearchSchema>;

export const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/',
  validateSearch: loginSearchSchema,
  component: Login,
});
