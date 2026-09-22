# Project CLAUDE.md

This file records the architecture decisions for this repo's MVVM rewrite
(tracking issue #1, decisions 5–11). It **overrides** the conflicting rules in
the user's global `~/.claude/CLAUDE.md` for this repo only — see
[Overrides of global rules](#overrides-of-global-rules) below.

These are short instructions, not a tutorial. When a slice's code disagrees
with this file, the code is wrong.

## Layout: `app/`, `features/`, `shared/`

- `app/` wires the app together (providers, router, layouts, mocks). No
  business logic lives here.
- Each feature (`features/<name>/`) uses: `screens/`, `components/`,
  `data-layer/entities/<entity>/`, `routes/`, and `hooks/` / `utils/` only
  when actually needed.
- `shared/` holds `ui/` (shadcn, generated, including its hooks under
  `ui/hooks/`), `components/`, `utils/`, `lib/`, `stores/`, `routing/`,
  `testing/`. A `shared/hooks/` folder is created only when a hand-written
  hook actually needs it.
- Auth is `features/auth`.
- Dead code is **deleted**, not moved to a new folder "just in case."

## Import rules (no feature-to-feature imports)

- `app` may import `features` and `shared`.
- A feature may import `shared` and itself. It may **not** import another
  feature.
- `shared` may only import `shared`.
- The session store lives in `shared/stores` so the auth guard, the HTTP
  client, and the navbar never need to import `features/auth`.
- Enforced with `eslint-plugin-boundaries`; `madge --circular` keeps checking
  for circular imports. Both run in `npm run validate` and must be clean.

## Ledger's nine component rules, adapted here

1. A ViewModel is a hand-written `use{Name}ViewModel` hook colocated with its
   component — no factories, no config-driven generation.
2. The component's `index.tsx` calls the ViewModel hook and spreads the
   result into a pure View.
3. **A View has no external dependencies.** Allowed: UI-only hooks, headless
   rendering machinery driven entirely by props (e.g. `useReactTable` inside
   the shared table), `<Link>`, and `import type` from the data-layer.
   Forbidden in a View: TanStack Query, router hooks, zustand stores, any
   runtime (non-type) data-layer import, any `use*ViewModel` hook, runtime
   TanStack Form or `use*Form` imports, zod, the HTTP client, and the
   `fetch`/storage/`window`/`document` globals. Enforced with
   `no-restricted-imports` and `no-restricted-globals` scoped to View files
   and `shared/components`. Pure, prop-driven adaptation to a rendering
   library (the Radix Select sentinel in `FilterCard`) belongs in the
   component. Anything that needs a cast at the View boundary is a contract
   bug in the props or the form hook and is fixed there, never with `as`.
4. **The View owns a flat props type**, exported as `{Name}ViewProps`. The
   ViewModel's return type must equal that type via a type-only import, so
   contract drift is a compile error.
5. Props are flat: nouns for data, `isX` for booleans, `onX` for handlers. A
   form crosses the boundary as a single `form` prop, typed from a small
   colocated form hook. Draft form values are plain `string`s; the form
   hook's zod schema validates them and parses them on submit. The View
   never narrows a widget value.
6. Optimistic update and rollback live in the entity's mutation options, not
   in the ViewModel.
7. The route owns loading and error, not the View or ViewModel (see below).
8. No ViewModel context/provider distributing a ViewModel to multiple
   consumers — one hook call per screen.
9. Screens are hand-written over prop-driven presentational components in
   `shared/components` and small composable hooks. No templates, no
   config-driven layer.

## Routes own loading and error

- The route loader awaits `queryClient.ensureQueryData(...)`, keyed by search
  params via `loaderDeps`.
- The ViewModel reads the same query with `useSuspenseQuery`, so the View
  always receives defined data and never branches on loading/error.
- The route's pending component is a skeleton colocated with the screen; the
  route's error component catches fetch/parse failures.
- Mutation-in-flight flags (`isSaving`, `saveError`, etc.) remain ordinary
  props from the ViewModel — they are not route-level concerns.
- Query flags such as `isFetching` are **not** View props. The loader re-runs
  on every `loaderDeps` change and the route shows its skeleton, so the View
  never needs a refetch indicator.
- The query client is provided through router context.

## Naming conventions

- PascalCase folder per component, containing `index.tsx`.
- View: `{Name}View.tsx`. ViewModel: `use{Name}ViewModel.ts` — no redundant
  feature prefix.
- Screens are suffixed `List` / `Detail` (e.g. `UserList`, `UserDetail`).
- Data-layer files are camelCase and entity-prefixed (`userSchema.ts`,
  `userApi.ts`, `userQueries.ts`, `userHandlers.ts`, `userFixtures.ts`).
- Tests are colocated as `*.test.ts` / `*.test.tsx`.
- Types are plain PascalCase — **no `I` or `T` prefix**.
- Zod schemas are camelCase.
- shadcn-generated files under `shared/ui/` (components and `ui/hooks/`) are
  left exactly as generated; `components.json` points shadcn's hook output
  there.
- Imports are relative inside a feature, `@/`-aliased across roots. No
  barrels beyond a component's own `index.tsx`.

## Testing rules

- Integration tests come first, colocated in each feature's
  `__integrations__/`, rendering the real route through MSW.
- Colocated View tests (plain props in, markup out) and ViewModel tests
  (`renderHook`) cover edge cases the integration tests don't.
- **Always use the custom renderer from `shared/testing`** (it returns
  `user` and the query client, and accepts `initialRoute` and `session`).
  Importing `@testing-library/react` directly anywhere else is a lint error.
- MSW is used only for our own network calls, with per-test `server.use()`
  overrides. `vi.mock` is only for irrelevant third-party modules.
- Handlers and fixtures are colocated in the entity's data-layer and shared
  with the dev-mode MSW worker.
- Coverage is tiered: `features` 80%, `shared/components` 90%,
  `shared/utils` and data-layer 100%, shadcn (`shared/ui`) excluded.
- **Every bug fix ships with a regression test.**

## Definition of done

`npm run validate` (typecheck, lint, circular-import check, tests) must pass
before a slice is considered done. This is the single gate — there is no
separate boundaries lint script.

## Overrides of global rules

This repo's conventions above take precedence over the following rules in
the user's global `~/.claude/CLAUDE.md`, for this repo only:

- **File naming:** global says snake_case files. This repo uses PascalCase
  component folders/files (`UserList/index.tsx`, `UserListView.tsx`,
  `useUserListViewModel.ts`) and camelCase for data-layer/util files, per
  Ledger's naming above.
- **Interfaces:** global says `I`-prefixed interfaces. This repo uses plain
  PascalCase types with no `I` or `T` prefix.
- **Folder structure:** global's generic React tree
  (`components/`, `features/`, `services/`, `hooks/`, `context/`, `utils/`,
  `types/`, `constants/`) is replaced by the `app/` / `features/` / `shared/`
  layout and import rules described above.
- **"Context for global state":** this repo uses zustand for global client
  state (the session, in `shared/stores`), not React Context. Per-feature
  stores are not used — URL search params, TanStack Query cache, and
  hook-local state cover the rest.
- **"Component calls Service":** this repo has no component-to-service
  layer. A View calls nothing external at all (see the View rules above);
  the ViewModel hook is the only thing that talks to the data-layer
  (TanStack Query + plain API functions + zod), and it does so directly, not
  through an injected service.
