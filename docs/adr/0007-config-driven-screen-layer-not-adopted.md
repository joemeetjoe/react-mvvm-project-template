# 0007. A config-driven screen layer is not adopted

## Status

Accepted (2026-09-21). Closes [issue #14](../../../../issues/14).

## Context

[ADR 0001](0001-hook-viewmodels-with-prop-injection.md) made hand-written hook ViewModels
the way to build a screen and parked a config-driven screen layer as a possible optional
layer on top. The previous config-driven version had been removed (issue #1, decision 3)
because it dispatched service calls by string name through `any`, ran the ViewModel once
per consumer, could not express the detail screen, and made config the only way to build
a screen.

Issue #14 explored whether the idea could return without those defects. The exploration
produced a written proposal,
[Proposal 0001](../proposals/0001-config-driven-screen-layer.md), backed by a throwaway
prototype of the users list declared by config. The prototype was typed end to end with
no `any`, returned the same `UserListViewProps` as the hand-written ViewModel, passed the
existing ViewModel behaviours and rendered the unmodified View, was opt-in per screen, and
could be deleted with `npm run validate` staying green. The prototype lives only on the
unmerged branch `issue/14-config-layer-proposal`; none of its code is in the codebase.

## Decision

The config-driven screen layer is not built. Hand-written hook ViewModels remain the only
way to build a screen.

Cross-cutting list behaviour (the page-reset policy for sort, page and filter handlers,
and the draft-form to URL synchronisation) goes to small `shared/hooks` composables when a
second and third list screen make the duplication real. The proposal sketches two, about
70 lines together.

## Alternatives considered

- **Build the opt-in layer as prototyped.** It answers all five defects of the removed
  version. Rejected on cost: 204 lines of generic machinery with seven type parameters,
  generalised from a single screen, to replace a 79-line hand-written ViewModel with 77
  lines of config and glue. The per-screen saving is two lines, so it does not amortise
  before roughly a hundred uniform list screens.
- **Build it later, unconditionally.** Rejected in favour of an explicit revisit trigger
  (below), so the question is reopened by evidence and not by preference.
- **`shared/hooks` composables (chosen).** They capture the only benefit with real
  duplication behind it, for about a third of the code, with one generic parameter, no
  config indirection and no second way to build a screen.

## Consequences

- Per-screen mapping code (search params to query, query data to View props) stays
  duplicated across list screens. That duplication is accepted as the cheaper of the two
  costs.
- There is one way to build a screen, so the pressure that made config the only way to
  build a screen cannot return. No type-level guarantee could have prevented that
  pressure; not having the layer does.
- Screens the layer could not have expressed anyway are unaffected: detail and edit
  screens with mutations and optimistic rollback, bespoke cell renderers, cross-field
  filters, screens with more than one query, selection and bulk actions.
- The `new-feature` scaffolder, not a runtime layer, is the answer to per-feature
  boilerplate.

## Revisit trigger

Reopen this decision only if all three hold: there are at least five list screens; they
are genuinely uniform (one query, one-to-one filters, no bespoke paging policy); and the
`shared/hooks` composables have demonstrably failed to stop those screens diverging. The
proposal and the `issue/14-config-layer-proposal` branch are the starting point.

## Relationship to Ledger's guidance

Follows Ledger's [MVVM pattern](https://developers.ledger.com/docs/ledger-live/contributing/reference/mvvm-pattern):
ViewModels are hand-written hooks and Views receive props. Ledger's guidance describes no
config-driven screen layer, so not adopting one is not a departure.
