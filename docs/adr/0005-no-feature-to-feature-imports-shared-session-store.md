# 0005. No feature-to-feature imports; shared session store

## Status

Accepted

## Context

The target layout separates `app/`, `features/`, and `shared/`, mirroring Ledger's
`apps/`, feature subfolders, and `libs/`. Without an enforced boundary, features could
reach into each other and shared code could reach into a feature, which would prevent
features from being cleanly deletable — one stated goal of the restructuring.

## Decision

`app/` may import features and shared; a feature may import shared and itself; shared
imports only shared. This is enforced with `eslint-plugin-boundaries`, and madge
continues to check for circular imports. The session store lives in `shared/stores`
(not in `features/auth`), so the auth guard, the HTTP client, and the navbar — all
shared or app-level code — never import `features/auth`.

## Alternatives considered

- **Leave the session in `features/auth` and let shared code import it.** Rejected: it
  would force the guard, HTTP client, and navbar to import a feature, breaking the
  one-directional boundary and making `features/auth` impossible to delete cleanly.
- **Rely on code review alone, with no enforced boundary.** Rejected: nothing would
  catch a feature-to-feature import before it shipped.

## Consequences

Features stay deletable: removing a feature directory cannot break another feature,
because none may import it. Auth-adjacent shared code (guard, HTTP client, navbar) can
read session state without depending on the `auth` feature.

Accepted cost: any concept shared by two or more features must be promoted to `shared/`
before either can use it, which is more upfront motion than letting one feature quietly
import from another.

## Relationship to Ledger's guidance

Follows Ledger's `apps/` / feature / `libs/` layering and its guidance on structuring a
feature: [architecture](https://developers.ledger.com/docs/ledger-live/contributing/reference/architecture),
[structure a feature](https://developers.ledger.com/docs/ledger-live/contributing/how-to/structure-a-feature).
