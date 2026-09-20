# 0003. No provider or repository abstraction; MSW at the network boundary

## Status

Accepted

## Context

The prior multi-provider API layer (REST, tRPC, GraphQL, mock) was mock-only in
practice: the provider override was hardcoded and the environment switch meant to select
between providers was never read. The abstraction added indirection without delivering
the switchability it was built for.

## Decision

There is no provider registry, no repository interface, and no dependency-injection
container for data access. The network boundary is mocked with MSW (Mock Service
Worker) at the HTTP layer, so nothing needs injecting to develop or test against fake
data. `VITE_API_MOCK` turns on the MSW browser worker in development. Handlers and
fixtures are colocated in each entity's data layer and shared with the dev-mode worker.

## Alternatives considered

- **Keep the multi-provider abstraction (REST/tRPC/GraphQL/mock).** Rejected: it was
  already effectively mock-only and untested, since the environment switch that selected
  a provider was dead code; keeping it would mean maintaining an abstraction with no live
  consumer.
- **A repository-interface layer with dependency injection instead of MSW.** Rejected:
  TanStack Query plus MSW already gives a mockable seam at the transport level, so an
  interface layer over the same seam would be a second abstraction doing the same job.

## Consequences

`@trpc/client` and `graphql-request` are removed once confirmed unused, since only one
data path (MSW-backed HTTP) remains. There is one seam to mock — the network — instead of
a provider registry and repository interfaces on top of it.

Accepted cost: ViewModel tests become integration-style. They exercise the real API
functions and TanStack Query hooks against MSW handlers, rather than against an injected
fake repository, per Ledger's testing strategy of integration tests first.

## Relationship to Ledger's guidance

Follows Ledger's [testing strategy](https://developers.ledger.com/docs/ledger-live/contributing/explanation/testing-strategy)
and [write tests](https://developers.ledger.com/docs/ledger-live/contributing/how-to/write-tests)
guidance of integration tests against a mocked network boundary, rather than against
injected fakes.
