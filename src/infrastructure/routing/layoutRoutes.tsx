import {
  createRootRouteWithContext,
  Outlet,
  createRoute,
} from '@tanstack/react-router';

import { authGuard } from '@/infrastructure/routing/authGuard';
import { MainLayout } from '@/app/layouts/MainLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import type { RouterContext } from '@/app/router/routerContext';

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
  beforeLoad: authGuard,
});
