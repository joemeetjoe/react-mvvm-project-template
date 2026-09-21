# React MVVM Project Template

A React + TypeScript template built around hand-written hook ViewModels, TanStack Query
as the data layer, and MSW at the network boundary. It has no Redux, no factories, and
no provider/repository abstraction — see [Relationship to Ledger's guidance](#relationship-to-ledgers-guidance)
and the [ADRs](docs/adr/README.md) for why.

## Contents

- [Relationship to Ledger's guidance](#relationship-to-ledgers-guidance)
- [Quick start](#quick-start)
- [Layout: `app/`, `features/`, `shared/`](#layout-app-features-shared)
- [The anatomy of a screen](#the-anatomy-of-a-screen)
- [The data layer](#the-data-layer)
- [Routing](#routing)
- [Testing](#testing)
- [Adding a feature: a worked walkthrough](#adding-a-feature-a-worked-walkthrough)

## Relationship to Ledger's guidance

The architecture follows [Ledger Live's MVVM and feature-first contributing
guidance](https://developers.ledger.com/docs/ledger-live/contributing/getting-started):
hook ViewModels, a `screens/` + `data-layer/` feature shape, the nine component rules,
and the testing strategy (integration tests first, always through a custom renderer).
It deliberately departs from Ledger in a few places — no Redux (TanStack Query's cache
plus URL search params replace it), no repository/provider abstraction (MSW mocks the
network boundary directly), and list state lives in URL search params rather than a
store. The full decision log is [issue #1](../../issues/1); the reasoning for each
decision is recorded once, in the [ADRs](docs/adr/README.md), and this README does not
repeat it.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

By default `VITE_API_MOCK=false` and requests go to `VITE_API_BASE_URL` (`/api`), so
there is no backend to talk to. To run entirely against the in-memory mock API (MSW),
either set `VITE_API_MOCK=true` in `.env` or run:

```bash
VITE_API_MOCK=true npm run dev
```

Sign in with `admin@example.com` or `user@example.com`, any password (see
`src/features/auth/data-layer/entities/session/sessionFixtures.ts`).

Other scripts (`package.json`):

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc -b --force` |
| `npm run lint` | ESLint, including the import-boundary and View-dependency rules |
| `npm run check-circular` | `madge --circular` over `src/` |
| `npm run test` | Run the Vitest suite once |
| `npm run test:coverage` | Run tests with the tiered coverage thresholds |
| `npm run validate` | typecheck + lint + check-circular + test — the single done gate, see [CONTRIBUTING.md](CONTRIBUTING.md) |
| `npm run preview` | Preview a production build |

## Layout: `app/`, `features/`, `shared/`

```
src/
├─ app/            wiring only: providers, router, layouts, the dev MSW worker
├─ features/
│  ├─ auth/
│  └─ users/
└─ shared/         ui/  components/  hooks/  lib/  stores/  routing/  testing/
```

- **`app/`** wires the app together and holds no business logic: `providers/`
  (`queryClient.ts`), `router/` (`layoutRoutes.tsx`, `router.tsx`, `authGuard.ts`,
  `routerContext.ts`), `layouts/` (`MainLayout.tsx`, `AuthLayout.tsx`, `AppNavbar.tsx`,
  `AppSidebar.tsx`, `sidebarConfig.ts`), and `mocks/` — `enableMocking.ts` starts the
  MSW browser worker only when `import.meta.env.DEV && VITE_API_MOCK === 'true'`, using
  the same handlers the tests run against.
- **`features/<name>/`** (`auth`, `users`) each use `screens/<Screen>/`,
  `data-layer/entities/<entity>/`, `routes/`, and `__integrations__/`.
- **`shared/`** holds `ui/` (shadcn output, left exactly as generated), `components/`
  (presentational, prop-driven — `DataTable`, `FilterCard`, `InfoCard`), `hooks/`,
  `lib/` (`http.ts`, `parseResponse.ts`, `utils.ts`), `stores/` (`sessionStore.ts`,
  the only global client store), `routing/` (`RouteErrorBoundary.tsx`), and `testing/`
  (the custom renderer and MSW test server).

### Import rules

- `app` may import `features` and `shared`.
- A feature may import `shared` and itself — **never another feature**.
- `shared` may only import `shared`.
- The session lives in `shared/stores/sessionStore.ts` so the router guard, the HTTP
  client, and the navbar never need to import `features/auth`.

This is enforced by `eslint-plugin-boundaries` (`eslint.config.js`) and by
`madge --circular` for circular imports; both run in `npm run validate`. Reasoning:
[ADR 0005](docs/adr/0005-no-feature-to-feature-imports-shared-session-store.md).

## The anatomy of a screen

Each screen is a folder under `features/<name>/screens/<Screen>/` with three parts,
using the users list (`features/users/screens/UserList/`) as the concrete example:

- **`index.tsx`** — calls the ViewModel hook and spreads the result into the View. It
  is the only place the two are wired together:

  ```tsx
  export const UserList = (): ReactElement => {
    const props = useUserListViewModel();
    return <UserListView {...props} />;
  };
  ```

- **`<Screen>View.tsx`** (`UserListView.tsx`) — a pure, presentational component. It
  **owns the props type**, exported as `<Screen>ViewProps` (`UserListViewProps`). A
  View has no external dependencies beyond: UI-only hooks, headless rendering
  machinery driven entirely by props (e.g. `useReactTable` inside `DataTable`),
  `<Link>` from the router, and `import type` from a data-layer. It may not import
  TanStack Query, router hooks other than `Link`, zustand stores, any
  `use*ViewModel` hook, or a data-layer module at runtime. This is enforced by the
  `no-restricted-imports` rule scoped to `**/*View.tsx` and `shared/components/**`
  in `eslint.config.js`. Reasoning: [ADR 0001](docs/adr/0001-hook-viewmodels-with-prop-injection.md).

- **`use<Screen>ViewModel.ts`** (`useUserListViewModel.ts`) — a hand-written hook, one
  per screen, with no factory and no shared context distributing it. Its return type
  is the View's props type, imported type-only, so a drifted contract is a compile
  error:

  ```ts
  export const useUserListViewModel = (): UserListViewProps => { ... };
  ```

  It reads route search params and params with `getRouteApi(...).useSearch()` /
  `useParams()`, reads data with `useSuspenseQuery`, and returns plain data plus
  `onX` handlers. A form crosses the View boundary as a single `form` prop, typed
  from a small colocated form hook (`useUserFilterForm.ts`, `useUserEditForm.ts`),
  not by the View importing `@tanstack/react-form` itself.

A screen may also have a `<Screen>Skeleton.tsx` (`UserListSkeleton.tsx`,
`UserDetailSkeleton.tsx`) — the route's `pendingComponent` — colocated here because
it belongs to the screen, not to routing.

Props are flat: nouns for data, `isX` for booleans, `onX` for handlers. Full rules:
[ADR 0001](docs/adr/0001-hook-viewmodels-with-prop-injection.md).

## The data layer

Per entity, under `features/<name>/data-layer/entities/<entity>/`
(`features/users/data-layer/entities/user/` is the reference):

- **`<entity>Schema.ts`** (`userSchema.ts`) — zod schemas and their inferred types.
  No React, no network code.
- **`<entity>Api.ts`** (`userApi.ts`) — plain async functions. Each calls
  `shared/lib/http.ts` (`httpGet`/`httpPatch`) and parses the response with
  `shared/lib/parseResponse.ts` against the zod schema, throwing a
  `ResponseParseError` on a shape mismatch.
- **`<entity>Queries.ts`** (`userQueries.ts`) — a query-key factory, `queryOptions()`
  per query, and mutation options. Optimistic update and rollback for a mutation live
  here (`userUpdateMutationOptions`), not in the ViewModel.
- **`<entity>Handlers.ts`** (`userHandlers.ts`) — MSW request handlers over a mutable
  in-memory copy of the fixtures. Shared between `src/app/mocks/handlers.ts` (the dev
  worker) and `src/shared/testing/server.ts` (the test server).
- **`<entity>Fixtures.ts`** (`userFixtures.ts`) — the seed data the handlers serve.

There is no provider registry and no repository interface: the network boundary is
mocked with MSW, so nothing needs injecting. Reasoning:
[ADR 0002](docs/adr/0002-tanstack-query-as-the-data-layer.md) and
[ADR 0003](docs/adr/0003-no-provider-or-repository-abstraction-msw-at-the-boundary.md).

## Routing

Each feature exports a route **factory** — `createXRoute(parentRoute)` — that wraps
`createRoute({ getParentRoute: () => parentRoute, ... })`. The factory takes its
parent as an argument instead of importing it, so a feature never imports `app/`:

```ts
// features/users/routes/userListRoute.tsx
export const createUserListRoute = <TParentRoute extends AnyRoute>(parentRoute: TParentRoute) =>
  createRoute({ getParentRoute: () => parentRoute, path: 'users', ... });
```

`src/app/router/layoutRoutes.tsx` owns the root and layout routes (`rootRoute`,
`mainLayoutRoute`, `authLayoutRoute`, `protectedLayoutRoute` — the last runs
`authGuard` in `beforeLoad`). `src/app/router/router.tsx` assembles the tree by
calling each feature's factory with the layout route it hangs off:

```ts
createUserListRoute(protectedLayoutRoute)
createUserDetailRoute(protectedLayoutRoute)
```

**The route owns loading and error, not the screen:**

- The loader awaits `context.queryClient.ensureQueryData(...)`, keyed by search
  params through `loaderDeps` when the route has search params (`userListRoute.tsx`).
- The ViewModel reads the same query with `useSuspenseQuery`, so the View always
  receives defined data and never branches on loading or error.
- `pendingComponent` is the screen's skeleton; `errorComponent` is
  `shared/routing/RouteErrorBoundary.tsx`, which catches fetch and parse failures.

List state (sort, direction, page, page size, filters) lives in the URL as search
params, validated by a zod schema on the route with `.catch(...)` fallbacks so an
invalid or stale URL still renders instead of erroring
(`userListSearchSchema` in `userListRoute.tsx`). Reasoning:
[ADR 0004](docs/adr/0004-list-state-in-url-search-params-zustand-for-global-state.md)
and [ADR 0006](docs/adr/0006-route-owns-loading-and-error.md).

## Testing

See [CONTRIBUTING.md](CONTRIBUTING.md#testing-strategy) for the full testing strategy,
coverage tiers, and the regression-test rule.

## Adding a feature: a worked walkthrough

This follows the same steps that built `features/users`, naming the real files. It
ends with the integration test, which is where you should start when you write your
own feature (integration tests come first, per
[CONTRIBUTING.md](CONTRIBUTING.md#testing-strategy)) — or generate the skeleton with
`npm run new-feature` (prompts for a feature and entity name) or
`npm run new-feature -- <feature> <entity>` (e.g. `npm run new-feature -- invoices
invoice`), which wires up steps 1–4 below and drops in the failing integration test
from step 5 for you to make pass. See `plopfile.js` and `plop-templates/new-feature/`.

1. **Data layer.** Under `features/<name>/data-layer/entities/<entity>/`, add:
   - `<entity>Schema.ts` — zod object schema, inferred `type`, and any enums
     (`userSchema.ts` exports `userSchema`, `User`, `userRoles`, ...).
   - `<entity>Api.ts` — async functions using `httpGet`/`httpPatch` from
     `shared/lib/http.ts`, parsed with `parseResponse` from `shared/lib/parseResponse.ts`.
   - `<entity>Fixtures.ts` — seed data matching the schema.
   - `<entity>Handlers.ts` — MSW handlers over the fixtures (`userHandlers.ts`
     exports `resetUserFixtures` too, for tests that mutate through PATCH).
   - `<entity>Queries.ts` — a key factory and `queryOptions()`/mutation options
     built on the api functions (`userQueries.ts` exports `userKeys`,
     `userListQueryOptions`, `userUpdateMutationOptions`).
   - Register the handlers: add them to the array in `src/shared/testing/server.ts`
     (tests) and `src/app/mocks/handlers.ts` (dev worker).

2. **Screen.** Under `features/<name>/screens/<Screen>/`, add:
   - `<Screen>View.tsx` exporting `<Screen>ViewProps` and the pure component
     (`UserListView.tsx`).
   - `use<Screen>ViewModel.ts` exporting `use<Screen>ViewModel(): <Screen>ViewProps`,
     reading route search/params and the query, returning data plus `onX` handlers
     (`useUserListViewModel.ts`).
   - `index.tsx` calling the hook and spreading the result into the View
     (`features/users/screens/UserList/index.tsx`).
   - Optionally a `<Screen>Skeleton.tsx` for the route's `pendingComponent`
     (`UserListSkeleton.tsx`).

3. **Route.** In `features/<name>/routes/<screen>Route.tsx`, export
   `create<Screen>Route(parentRoute)`, with a `loader` that calls
   `context.queryClient.ensureQueryData(...)`, `pendingComponent` set to the
   skeleton, and `errorComponent` set to `RouteErrorBoundary` from
   `shared/routing/RouteErrorBoundary.tsx` (`userListRoute.tsx`).

4. **Wire it in.** In `src/app/router/router.tsx`, import the factory and add
   `create<Screen>Route(protectedLayoutRoute)` (or `authLayoutRoute` for an
   unauthenticated screen) to that layout route's `addChildren([...])` list —
   this is the one place a feature's route touches `app/`, and the feature itself
   never imports it back.

5. **Integration test.** In `features/<name>/__integrations__/<name>.test.tsx`,
   render the real route and assert against the fixtures, using the custom renderer:

   ```tsx
   import { renderRoute, screen } from '@/shared/testing/render';

   it('renders a row for every user the API returns', async () => {
     renderRoute({ initialRoute: '/users' });

     expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
   });
   ```

   `features/users/__integrations__/userList.test.tsx` has the full set this
   pattern extends to: the pending skeleton, the route error component (both a
   failed request and a response that fails to parse), sorting and paging through
   the UI while checking `router.state.location.search`, filtering, and an edit
   that shows the saved value immediately.

Colocated `<Screen>View.test.tsx` (plain props in, markup out, via `render` from
`shared/testing/render.tsx`) and `use<Screen>ViewModel.test.ts` (via `renderHook`,
passing `searchRoutes` when the hook reads route search params — see
`useUserListViewModel.test.ts`) cover edge cases the integration test doesn't.
