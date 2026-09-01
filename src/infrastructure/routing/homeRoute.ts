import { createRoute } from '@tanstack/react-router';
import { authLayoutRoute } from './layoutRoutes';
import { lazy } from 'react';

export const homeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/',
  component: lazy(() => import('@/infrastructure/pages/LoginPage')),
});
