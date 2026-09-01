import { createRoute } from '@tanstack/react-router';
import { protectedLayoutRoute } from '@/infrastructure/routing/layoutRoutes';
import { RouteErrorBoundary } from '@/infrastructure/routing/RouteErrorBoundary';
import { useUsersListVM } from '../vm/listVM';
import { UsersListPage } from '../view/ListPage';

export const usersListRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'users',
  loader: () => ({
    useVM: useUsersListVM,
  }),
  component: UsersListPage,
  errorComponent: RouteErrorBoundary,
});
