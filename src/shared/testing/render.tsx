import { type ReactElement, type ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type Session, applySession } from './session';

export { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';

export type UserEvent = ReturnType<typeof userEvent.setup>;

export type RenderResult = ReturnType<typeof rtlRender> & { user: UserEvent };

export type ProviderOptions = {
  /** The path the memory history starts on. */
  initialRoute?: string;
  /** Seeds the session before anything renders; `null` renders signed out. */
  session?: Session | null;
};

/**
 * Renders a component on its own, with no providers. Views are pure, so this is
 * all a View test needs — and it keeps `@testing-library/react` imported in
 * exactly one place.
 */
export const render = (ui: ReactElement): RenderResult => ({
  user: userEvent.setup(),
  ...rtlRender(ui),
});

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

type TestRouterContext = { queryClient: QueryClient };

/**
 * A throwaway router whose every path renders `children`, so a hook under test
 * sees the same router and query-client context it will see in the app.
 */
const createHostRouter = (children: ReactNode, initialRoute: string, queryClient: QueryClient) => {
  const host = (): ReactElement => <Suspense fallback={null}>{children}</Suspense>;

  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: () => <Outlet />,
  });

  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: host }),
    createRoute({ getParentRoute: () => rootRoute, path: '$', component: host }),
  ]);

  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialRoute] }),
  });
};

export type RenderHookResult<TResult> = ReturnType<
  typeof rtlRenderHook<TResult | null, void>
> & {
  user: UserEvent;
  queryClient: QueryClient;
};

/**
 * Renders a ViewModel hook inside the app's providers. The hook suspends while
 * its query loads, so `result.current` is `null` until the data arrives — wait
 * on it with `waitFor`.
 */
export const renderHook = <TResult,>(
  hook: () => TResult,
  { initialRoute = '/', session }: ProviderOptions = {},
): RenderHookResult<TResult> => {
  applySession(session);

  const queryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createHostRouter(children, initialRoute, queryClient)} />
    </QueryClientProvider>
  );

  return {
    user: userEvent.setup(),
    queryClient,
    ...rtlRenderHook<TResult | null, void>(hook, { wrapper }),
  };
};
