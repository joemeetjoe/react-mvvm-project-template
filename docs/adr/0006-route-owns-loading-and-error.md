# 0006. The route owns loading and error: `ensureQueryData` plus `useSuspenseQuery`

## Status

Accepted

## Context

A View is required to have no external dependencies beyond its props — no query hooks,
no router hooks, no branching on loading or error state. Query hooks naturally produce
loading and error states while data is in flight, so those states need an owner other
than the View or the ViewModel.

## Decision

The route's loader awaits `ensureQueryData` (keyed by search params through
`loaderDeps`); the ViewModel reads the same query with `useSuspenseQuery`, so the View
always receives defined data with no loading or error branches. The route's pending
component is a skeleton colocated with the screen; the route's error component catches
fetch and parse failures. Mutation flags (`isSaving`, `saveError`) remain props on the
View, since they represent an in-flight user action rather than the initial load. The
query client is provided through router context.

## Alternatives considered

- **Loading/error branches inside the ViewModel or View** (e.g. `if (isLoading) return
  <Spinner />`). Rejected: it violates the rule that a View has no external dependencies,
  and it pushes a route-level concern — what to show before data exists — into the
  ViewModel or View.
- **`useQuery` with a manual loading check, instead of `useSuspenseQuery`.** Rejected:
  the ViewModel would still have to branch on loading state itself instead of the route
  resolving it before the View ever renders.

## Consequences

Views only ever render with real data, which keeps their prop types free of loading and
error branches and simplifies their tests.

Accepted cost: ViewModel tests need a Suspense boundary, since `useSuspenseQuery` throws
while its query is pending; loading state is not a View prop and cannot be asserted on
directly from a View's own tests.

## Relationship to Ledger's guidance

Follows Ledger's [component patterns (9 rules)](https://developers.ledger.com/docs/ledger-live/contributing/reference/component-patterns)
rule that a View has no external dependencies, applying it to the loading/error case by
moving loading and error ownership to the route rather than the View or ViewModel.
