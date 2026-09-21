# Contributing

This file assumes you've read the [README](README.md), especially
[the layout](README.md#layout-app-features-shared) and
[the anatomy of a screen](README.md#the-anatomy-of-a-screen). The reasoning behind the
rules below is recorded once, in the [ADRs](docs/adr/README.md); this file states the
rules, not the reasoning.

## The validate gate and CI

`npm run validate` runs, in order: `typecheck` (`tsc -b --force`), `lint` (ESLint,
including the import-boundary and View-dependency rules), `check-circular`
(`madge --circular` over `src/`), and `test` (`vitest run`). It is the single
definition of done — there is no separate boundaries or type-check step to remember.

`.github/workflows/ci.yml` runs `npm ci` then `npm run validate` on every pull request
and on push to `main`. A change is not done until `npm run validate` passes locally.

A separate `e2e` CI job runs the Playwright smoke suite (`npm run test:e2e`) alongside
`validate`, not inside it, so it never slows down or gates the definition of done above.

## Testing strategy

- **Integration tests come first.** For a screen, write the test in the feature's
  `__integrations__/` directory before the implementation. It renders the real route
  tree (loader, pending component, error component included) against MSW, using
  `renderRoute` from `src/shared/testing/render.tsx`. See
  `features/users/__integrations__/userList.test.tsx` for the shape: one `describe`
  per route, one `it` per behavior (initial render, redirect when signed out, pending
  skeleton, fetch error, parse error, navigation, sort, page, filter, edit).
- **Always use the custom renderer.** `src/shared/testing/render.tsx` exports:
  - `render` — a bare component/View, wrapped only in enough router context for a
    `<Link>` to work. Use it for View tests.
  - `renderRoute` — the real route tree through MSW; takes `initialRoute` and
    `session`, returns `user` (a `userEvent` instance) and `router`. Use it for
    integration tests.
  - `renderHook` — a ViewModel hook inside the app's providers, suspended until its
    query resolves; takes `initialRoute`, `session`, and `searchRoutes` (needed when
    the hook reads route search params — see `useUserListViewModel.test.ts`). Use it
    for ViewModel edge cases the integration test doesn't cover.

  Importing `@testing-library/react` or `@testing-library/user-event` directly
  anywhere outside `src/shared/testing/` is a lint error
  (`no-restricted-imports` in `eslint.config.js`).
- **MSW is for our own network calls only**, with per-test overrides via
  `server.use(...)` from `src/shared/testing/server.ts` (see the fetch-error and
  parse-error cases in `userList.test.tsx`). `vi.mock` is reserved for irrelevant
  third-party modules, not for our own API or data-layer functions.
- **Handlers and fixtures are colocated** in each entity's data-layer
  (`<entity>Handlers.ts`, `<entity>Fixtures.ts`) and shared between the test server
  (`shared/testing/server.ts`) and the dev-mode MSW worker (`app/mocks/handlers.ts`).
  A handler that mutates state (e.g. `userHandlers.ts`'s PATCH) exports a reset
  function (`resetUserFixtures`) to call between tests.
- **Coverage is tiered** (`vitest.config.ts`, `coverage.thresholds`):
  `src/app/**` 80%, `src/features/**` 80%, `src/features/*/data-layer/**` 100%,
  `src/shared/components/**` / `src/shared/hooks/**` / `src/shared/routing/**` 90%,
  `src/shared/lib/**` / `src/shared/utils/**` / `src/shared/stores/**` 100%,
  `src/shared/ui/**` (shadcn output) excluded. Run `npm run test:coverage` to check.

## End-to-end vs integration test

**Integration tests come first — write one before reaching for Playwright.** An
integration test (`renderRoute` against MSW, see above) already exercises the real
route tree, loaders, and network layer inside jsdom; it's fast, runs in every `npm run
test`, and is where sort/page/filter/edit/validation/error-branch behavior belongs.

**End-to-end (`e2e/`, Playwright) is a thin smoke layer above that**, for the small set
of things a jsdom integration test can't see: does the app actually boot in a real
browser, does client-side routing work end to end, does the real MSW *worker* (not the
test server) serve data, does a full-page reload/login/logout cycle behave. Reach for
an e2e test only when the thing you're proving is boot- or routing-level, not a new
business rule — if you're tempted to add a second e2e test to cover a variant (a filter
combination, a validation error, a role), that variant belongs in an integration test
instead, and the smoke suite (`playwright.config.ts`, `testDir: e2e`) stays small on
purpose. Run it locally with `npm run test:e2e` (chromium, firefox, and webkit); it
runs in CI as its own job, separate from `validate`.

## Regression-test rule

**Every bug fix ships with a regression test.** Before fixing a bug, write a test
that reproduces it (an integration test if the bug is user-visible, a colocated View
or ViewModel test otherwise) and confirm it fails. The fix is done when that test
passes and `npm run validate` is clean.

## Naming conventions

- PascalCase folder per component, containing `index.tsx` (`UserList/index.tsx`).
- View: `{Name}View.tsx` (`UserListView.tsx`). ViewModel: `use{Name}ViewModel.ts`,
  no redundant feature prefix (`useUserListViewModel.ts`, not
  `useUsersUserListViewModel.ts`).
- Screens are suffixed `List` / `Detail` (`UserList`, `UserDetail`).
- Data-layer files are camelCase and entity-prefixed: `userSchema.ts`, `userApi.ts`,
  `userQueries.ts`, `userHandlers.ts`, `userFixtures.ts`.
- Tests are colocated as `*.test.ts` / `*.test.tsx`, next to the file they test.
  Integration tests live in the feature's `__integrations__/`.
- Types are plain PascalCase — no `I` or `T` prefix (`User`, not `IUser`).
- Zod schemas are camelCase (`userSchema`, `userUpdateSchema`).
- shadcn-generated files under `src/shared/ui/` are left exactly as generated —
  don't hand-edit them; regenerate instead.
- Imports are relative inside a feature, `@/`-aliased (`@/shared/...`,
  `@/features/...`) across roots. No barrels beyond a component's own `index.tsx`.

## Import boundaries

`app` may import `features` and `shared`; a feature may import `shared` and itself but
never another feature; `shared` may only import `shared`. See
[README: import rules](README.md#import-rules) and
[ADR 0005](docs/adr/0005-no-feature-to-feature-imports-shared-session-store.md). This
is enforced by `eslint-plugin-boundaries` and `madge --circular`, both part of
`npm run validate` — a pull request that violates a boundary fails CI.
