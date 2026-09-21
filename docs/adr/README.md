# Architecture Decision Records

This index tracks the architecture decisions for the MVVM restructuring described in
[issue #1](../../../../issues/1). The rationale in each ADR is drawn from that issue's
decision log; ADRs 0001 to 0006 do not introduce rationale beyond it. ADR 0007 records the
outcome of [issue #14](../../../../issues/14) and draws on
[Proposal 0001](../proposals/0001-config-driven-screen-layer.md).

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-hook-viewmodels-with-prop-injection.md) | Hook ViewModels with prop injection, not MobX or class ViewModels | Accepted |
| [0002](0002-tanstack-query-as-the-data-layer.md) | TanStack Query as the data layer, in place of Redux | Accepted |
| [0003](0003-no-provider-or-repository-abstraction-msw-at-the-boundary.md) | No provider or repository abstraction; MSW at the network boundary | Accepted |
| [0004](0004-list-state-in-url-search-params-zustand-for-global-state.md) | List state in URL search params; zustand for global state only | Accepted |
| [0005](0005-no-feature-to-feature-imports-shared-session-store.md) | No feature-to-feature imports; shared session store | Accepted |
| [0006](0006-route-owns-loading-and-error.md) | The route owns loading and error: `ensureQueryData` plus `useSuspenseQuery` | Accepted |
| [0007](0007-config-driven-screen-layer-not-adopted.md) | A config-driven screen layer is not adopted | Accepted |

## Ledger guidance referenced

These ADRs follow or depart from Ledger Live's contributing documentation, cited in
[issue #1](../../../../issues/1):

- [MVVM pattern](https://developers.ledger.com/docs/ledger-live/contributing/reference/mvvm-pattern)
- [Architecture](https://developers.ledger.com/docs/ledger-live/contributing/reference/architecture)
- [Structure a feature](https://developers.ledger.com/docs/ledger-live/contributing/how-to/structure-a-feature)
- [Component patterns (9 rules)](https://developers.ledger.com/docs/ledger-live/contributing/reference/component-patterns)
- [Architecture decisions](https://developers.ledger.com/docs/ledger-live/contributing/explanation/architecture-decisions)
- [Testing strategy](https://developers.ledger.com/docs/ledger-live/contributing/explanation/testing-strategy)
- [Write tests](https://developers.ledger.com/docs/ledger-live/contributing/how-to/write-tests)

Note: ADR 0001 parked a config-driven screen layer as a possible *optional* layer on top
of hand-written hook ViewModels. ADR 0007 records that it was explored and not adopted.
