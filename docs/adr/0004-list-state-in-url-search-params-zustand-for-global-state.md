# 0004. List state in URL search params; zustand for global state only

## Status

Accepted

## Context

Pagination and selection state previously existed twice — in the ViewModel and in the
table component — and about half of the ViewModel's state was never read. Global client
state was also held in per-feature zustand stores alongside this list state.

## Decision

Filters, sort, page and page size live in TanStack Router search params, validated by
zod on the route. Row selection, dialog state, and edit mode are hook-local state. Form
drafts live in TanStack Form. zustand holds only global client state — the session — and
per-feature zustand stores are deleted.

## Alternatives considered

- **Keep list state as ViewModel/component local state only.** Rejected: it does not
  survive navigation and is not shareable or bookmarkable, and it was already the source
  of the duplicated pagination/selection state between the ViewModel and the table
  component.
- **A per-feature zustand store for list state.** Rejected: it duplicates state the URL
  can already express, and it does not give the back/forward navigation or shareable-link
  behavior that URL-held state gives without extra code.

## Consequences

List state is shareable via URL and survives reloads and back/forward navigation without
a client store to keep in sync with it. Per-feature zustand stores are deleted, leaving a
single global store for session state.

Accepted cost: ViewModel tests that exercise list state now need a router in the test
harness (route and search params) instead of reading a hook's local state directly.

## Relationship to Ledger's guidance

Issue #1 does not cite a Ledger page specifically addressing where list/filter state
should live, so this decision is not recorded here as following or departing from a
specific Ledger URL. See the final report for this gap.
