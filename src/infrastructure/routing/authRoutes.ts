import { createRoute } from '@tanstack/react-router';
import { authLayoutRoute } from './layoutRoutes';
import { lazy } from 'react';

export const loginFailedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'login-failed',
  component: lazy(() => import('@/infrastructure/pages/LoginFailedPage')),
});
