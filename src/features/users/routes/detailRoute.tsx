import { createRoute } from '@tanstack/react-router';
import { protectedLayoutRoute } from '@/infrastructure/routing/layoutRoutes';
import { RouteErrorBoundary } from '@/infrastructure/routing/RouteErrorBoundary';
import { UsersDetailPage } from '../view/DetailPage';

export const usersDetailRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'users/$userId',
  component: UsersDetailPage,
  errorComponent: RouteErrorBoundary,
});
