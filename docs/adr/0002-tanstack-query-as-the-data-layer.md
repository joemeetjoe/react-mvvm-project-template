# 0002. TanStack Query as the data layer, in place of Redux

## Status

Accepted

## Context

The plan this project follows is based on Ledger Live's contributing guidance, whose
state layer is built around Redux-style slices, selectors and actions. In the prior
implementation, pagination and selection state existed twice — once in the ViewModel and
once in the table component — and about half of the ViewModel's state was never read.
The multi-provider API layer (REST, tRPC, GraphQL, mock) that fed this state was
mock-only in practice: the provider override was hardcoded and the environment switch
that was meant to select a provider was never read.

## Decision

The data layer is TanStack Query, plain API functions, and zod — one set per entity: a
zod schema (with the type inferred from it), an API module of plain async functions that
parse responses (no React), a queries module (query options, a key factory, and mutation
options), and MSW handlers and fixtures. Ledger's selectors become query `select` options
or plain functions; actions become mutations; slices become the query cache itself. No
provider registry, repository interface, or DI container sits between the API modules
and TanStack Query.

## Alternatives considered

- **Keep Redux-style slices, selectors and actions, as in Ledger's own state layer.**
  Rejected: it duplicates server data in a second client-side store that needs manual
  cache invalidation, which is exactly what TanStack Query provides without hand-written
  code, and it does not explain the duplicated pagination/selection state already
  observed.
- **Keep the multi-provider abstraction (REST/tRPC/GraphQL/mock) as the data source.**
  Addressed separately in [ADR 0003](0003-no-provider-or-repository-abstraction-msw-at-the-boundary.md);
  it was already effectively mock-only and not a live alternative.

## Consequences

Server state is owned by the query cache; there is no separate client-side store for
entity data, which removes the duplicate pagination/selection state problem for
query-backed data.

Accepted cost: anyone used to reading Redux devtools, slices, selectors and actions must
learn TanStack Query's cache, query keys, and `select`/mutation conventions instead —
there is no slice reducer to point to.

## Relationship to Ledger's guidance

Departs from Ledger's Redux-based slice/selector/action state layer, described in
Ledger's [architecture decisions](https://developers.ledger.com/docs/ledger-live/contributing/explanation/architecture-decisions)
page, translating slices to the query cache, selectors to `select` options, and actions
to mutations rather than adopting Redux itself.
