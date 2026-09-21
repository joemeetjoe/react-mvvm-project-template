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
  type AnyRoute,
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
 * A ViewModel hook that reads `useSearch({ from: someId })` needs the host
 * router to have a real route registered at that exact id (decision 4's
 * accepted cost) — the generic `/` and `$` routes below don't have one. `id`
 * is the route's full id as the app's router resolves it (e.g.
 * `/mainLayout/protectedLayout/users`, including pathless layout routes) —
 * every segment but the last becomes a pathless ancestor, so the id matches.
 */
export type HostSearchRoute = {
  id: string;
  validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
};

/**
 * Builds a route at `path`, wrapped in a pathless ancestor for each entry in
 * `ancestorIds`, wiring each level's `addChildren` so the tree actually
 * matches (unlike `getParentRoute`, which only carries type/context info).
 * Returns the outermost route, ready to hang off `rootRoute.addChildren`.
 */
const buildNestedRoute = (
  parent: AnyRoute,
  ancestorIds: string[],
  path: string,
  validateSearch: HostSearchRoute['validateSearch'],
): AnyRoute => {
  const [id, ...rest] = ancestorIds;

  if (id === undefined) {
    return createRoute({ getParentRoute: () => parent, path, validateSearch, component: HostRoute });
  }

  const ancestor = createRoute({ getParentRoute: () => parent, id, component: () => <Outlet /> });

  return ancestor.addChildren([buildNestedRoute(ancestor, rest, path, validateSearch)]) as AnyRoute;
};

/**
 * A throwaway router whose every path renders the host children, so a hook
 * under test sees the same router and query-client context as in the app.
 */
const createHostRouter = (
  initialRoute: string,
  queryClient: QueryClient,
  searchRoutes: HostSearchRoute[] = [],
) => {
  const rootRoute = createRootRouteWithContext<TestRouterContext>()({
    component: () => <Outlet />,
  });

  const hostRouteTree = rootRoute.addChildren([
    ...searchRoutes.map(({ id, validateSearch }) => {
      const segments = id.split('/').filter(Boolean);
      const path = segments[segments.length - 1] ?? id;
      const ancestorIds = segments.slice(0, -1);

      return buildNestedRoute(rootRoute, ancestorIds, path, validateSearch);
    }),
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

export type RouteRenderResult = RenderResult & {
  queryClient: QueryClient;
  /** Exposed so a test can drive `router.history.back()` / `.forward()`. */
  router: ReturnType<typeof createRouter>;
};

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
    router,
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
  {
    initialRoute = '/',
    session,
    searchRoutes,
  }: ProviderOptions & { searchRoutes?: HostSearchRoute[] } = {},
): RenderHookResult<TResult> => {
  applySession(session);

  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    const [router] = useState(() => createHostRouter(initialRoute, queryClient, searchRoutes));

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
