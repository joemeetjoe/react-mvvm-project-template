import {
  type ReactElement,
  type ReactNode,
  Suspense,
  createContext,
  useContext,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Outlet,
  RouterContextProvider,
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

import { routeTree } from '@/app/router/router';

import { type Session, applySession } from './session';

export { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';

export type UserEvent = ReturnType<typeof userEvent.setup>;

export type RenderResult = ReturnType<typeof rtlRender> & { user: UserEvent };

export type ProviderOptions = {
  /** The path the memory history starts on. */
  initialRoute?: string;
  /** Seeds the session before anything renders; `null` renders signed out. */
  session?: Session | null;
};

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

type TestRouterContext = { queryClient: QueryClient };

/**
 * The host router is built once per `renderHook` call, so what it renders has
 * to reach it through context rather than through a closure that would go stale.
 */
const HostChildrenContext = createContext<ReactNode>(null);

const HostRoute = (): ReactElement => (
  <Suspense fallback={null}>{useContext(HostChildrenContext)}</Suspense>
);

/**
 * A throwaway router whose every path renders the host children, so a hook
 * under test sees the same router and query-client context as in the app.
 */
const createHostRouter = (initialRoute: string, queryClient: QueryClient) => {
  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: () => <Outlet />,
  });

  const hostRouteTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: HostRoute }),
    createRoute({ getParentRoute: () => rootRoute, path: '$', component: HostRoute }),
  ]);

  return createRouter({
    routeTree: hostRouteTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialRoute] }),
  });
};

/**
 * Renders a component on its own. Views are pure, so this needs no providers
 * beyond a router context — present only so a View's own `<Link>` (the one
 * router import decision 7 allows) has somewhere to read it from. Uses
 * `RouterContextProvider` rather than `RouterProvider` so it supplies that
 * context without the async route matching a full router render would need.
 */
export const render = (ui: ReactElement): RenderResult => {
  const router = createHostRouter('/', createTestQueryClient());

  return {
    user: userEvent.setup(),
    ...rtlRender(<RouterContextProvider router={router}>{ui}</RouterContextProvider>),
  };
};

export type RouteRenderResult = RenderResult & { queryClient: QueryClient };

/**
 * Renders the real application route tree at `initialRoute`, so an integration
 * test exercises the route's loader, pending component and error component
 * exactly as the app does.
 */
export const renderRoute = ({
  initialRoute = '/',
  session,
}: ProviderOptions = {}): RouteRenderResult => {
  applySession(session);

  const queryClient = createTestQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialRoute] }),
  });

  return {
    user: userEvent.setup(),
    queryClient,
    ...rtlRender(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
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

  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    const [router] = useState(() => createHostRouter(initialRoute, queryClient));

    return (
      <QueryClientProvider client={queryClient}>
        <HostChildrenContext.Provider value={children}>
          <RouterProvider router={router} />
        </HostChildrenContext.Provider>
      </QueryClientProvider>
    );
  };

  return {
    user: userEvent.setup(),
    queryClient,
    ...rtlRenderHook<TResult | null, void>(hook, { wrapper: Wrapper }),
  };
};
