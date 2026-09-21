# 0001. Hook ViewModels with prop injection, not MobX or class ViewModels

## Status

Accepted

## Context

The prior implementation produced ViewModels from config-driven factories that called
service methods by string name through `any`, so the ViewModel-to-service contract was
unchecked. This already hid a bug: the list ViewModel sent `sortingState` while the
handler read `sortConfig`, so sorting never took effect. The ViewModel was also
distributed through a React context that stored the hook itself; each of the four
consumers re-invoked it, so the list ViewModel ran four times per render. Views were
one-line wrappers around generic templates, and the detail screen could not fit that
template: it diverged with hooks in the View, no loader, and a View-to-model import.

## Decision

A ViewModel is a hand-written `useXViewModel` hook colocated with its component. The
component's `index.tsx` calls the hook and spreads the result into a pure View (Ledger
Rule 9). The View exports a flat `XViewProps` type; the ViewModel's return type is that
same type via a type-only import, so contract drift between the two is a compile error.
Props are flat: nouns for data, `isX` for flags, `onX` for handlers. A form crosses the
View boundary as a single `form` prop, typed from a small colocated form hook.

## Alternatives considered

- **A class-based ViewModel library (e.g. MobX).** Rejected: it would keep the
  factory-style machinery (base classes, HOCs, lifecycle methods) and add a second
  reactivity system running alongside TanStack Query.
- **Continue with config-driven factories generating ViewModels from templates.**
  Rejected: screens did not fit uniformly (the detail screen had already diverged), and
  the string-keyed service dispatch was unchecked and had already caused a shipped bug.

## Consequences

Every screen has its own hand-written hook and View pair; there is no shared factory or
template machinery to change in one place, so cross-cutting behavior instead lives in
`shared/hooks` and `shared/components`. Contract drift between a ViewModel and its View
becomes a compile-time type error instead of a runtime lookup failure, and the
context-distributed hook (and its four-times-per-render cost) is removed.

Accepted cost: more boilerplate per screen than a factory would have generated. This is
accepted in exchange for a checked ViewModel-to-View contract and predictable,
single-invocation rendering.

A config-driven screen layer generated from a schema was parked here as a possible
optional layer on top of this pattern, never a replacement for hand-written hook
ViewModels. It was later explored and **not adopted**: see
[ADR 0007](0007-config-driven-screen-layer-not-adopted.md).

## Relationship to Ledger's guidance

Follows Ledger's [MVVM pattern](https://developers.ledger.com/docs/ledger-live/contributing/reference/mvvm-pattern)
(hook ViewModel plus pure View) and Ledger's
[component patterns (9 rules)](https://developers.ledger.com/docs/ledger-live/contributing/reference/component-patterns),
specifically the rule that a View spreads its ViewModel's return value as props.
