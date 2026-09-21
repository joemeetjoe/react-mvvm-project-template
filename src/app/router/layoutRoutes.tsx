import {
  createRootRouteWithContext,
  Outlet,
  createRoute,
} from '@tanstack/react-router';

import { MainLayout } from '@/app/layouts/MainLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';

import { authGuard } from './authGuard';
import type { RouterContext } from './routerContext';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />
});

export const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'mainLayout',
  component: MainLayout,
});

export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authLayout',
  component: AuthLayout,
});

export const protectedLayoutRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  id: 'protectedLayout',
  component: () => <Outlet />,
  beforeLoad: ({ location }) => authGuard(location),
});
