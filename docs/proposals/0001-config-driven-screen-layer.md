# Proposal 0001. A config-driven screen layer on top of hand-written ViewModels

**Status:** Decided 2026-09-21: not built. Recorded in [ADR 0007](../adr/0007-config-driven-screen-layer-not-adopted.md) ([issue #14](../../../../issues/14))
**Recommendation:** **Do not build it.** Extract two `shared/hooks` composables instead, and
revisit only under the trigger in [Recommendation](#recommendation).

Everything below is backed by a working prototype on the unmerged branch
`issue/14-config-layer-proposal`; the prototype is not in the codebase. It is
**throwaway** and is isolated in two folders on that branch:

- `src/shared/screen-config/` — the generic layer.
- `src/features/users/screens/UserList/__prototype__/` — the users-list config, the
  config-driven ViewModel, and the comparison tests.

`src/app/router` is untouched: the real `/users` route still uses the hand-written
`useUserListViewModel`. No existing test was modified.

---

## 1. Problem

ADR 0001 parks a config-driven screen layer as "a possible optional layer to add later on
top of this pattern." The owner likes the config-driven approach. The question this
proposal answers is narrow and empirical: **can a config layer be built that avoids every
defect that removed the previous one, and if so, is it worth its cost?**

The first half is a yes. The second half is the interesting part.

## 2. Constraints (from issue #1, decision 3, and ADR 0001)

The previous config layer was removed for five specific defects. Any replacement has to
answer all of them:

| # | Defect of the removed layer | Requirement |
| --- | --- | --- |
| C1 | Dispatched service calls by string name through `any`, hiding a shipped sorting bug (`sortingState` vs `sortConfig`) | Fully typed from config to data-layer; no `any`; the config holds real query-options factories and typed accessors; a typo is a compile error |
| C2 | Distributed the ViewModel through a React context storing the hook, so four consumers re-invoked it per render | A plain hook, called once in `index.tsx` |
| C3 | Could not express the detail screen, which diverged (hooks in the View, no loader, View→model import) | The layer must state what it cannot express, and such screens fall back cleanly |
| C4 | Config became the only way to build a screen | Opt-in per screen; hand-written stays the default |
| C5 | Views were one-line wrappers around generic templates | The layer produces **props**, never markup; the View and its tests must not know which ViewModel produced them |

Two further constraints come from the current rules:

- **Decision 6 / ADR 0005:** `shared` may import only `shared`. A generic layer living in
  `shared/` can never see `User`, `UserSortField`, `UserListViewProps`, or a route id.
- **Decision 8 / ADR 0001:** the View owns `{Name}ViewProps`; the ViewModel's return type
  *is* that type. A config-driven ViewModel must therefore return `UserListViewProps`
  exactly, not a superset it happens to be compatible with.

## 3. The design

### 3.1 Shape

The layer is split so that nothing generic ever needs a feature's names:

```
feature config (types known)  ──▶  useListScreen  ──▶  ListScreenState
       │                            (shared, generic)        │
       └── route hook, query options, typed accessors        ▼
                                                    feature ViewModel glue
                                                    ──▶ UserListViewProps
```

The layer produces a **generic** `ListScreenState`. A ~24-line feature-side ViewModel maps
that onto the View's own props type. The layer never imports, names, or constructs
`UserListViewProps` — which is exactly why C5 cannot recur: there is no template to wrap.

### 3.2 The typed accessor (the answer to C1)

The whole type story rests on one primitive, in `src/shared/screen-config/listScreenConfig.ts`:

```ts
export type SearchField<TSearch, TValue> = {
  read: (search: TSearch) => TValue;
  write: (search: TSearch, value: TValue) => TSearch;
};

export const searchFields =
  <TSearch extends object>() =>
  <TKey extends keyof TSearch>(key: TKey): SearchField<TSearch, TSearch[TKey]> => ({
    read: (search) => search[key],
    write: (search, value) => {
      const next: TSearch = { ...search };
      next[key] = value;          // sound: TKey extends keyof TSearch, value is TSearch[TKey]
      return next;
    },
  });
```

`searchFields<UserListSearch>()('page')` is `SearchField<UserListSearch, number>`.
`('pge')` does not compile. Because `TValue` appears in both an output position (`read`)
and an input position (`write`), `SearchField` is **invariant** under `strictFunctionTypes`
— so binding a `role`-typed accessor where a `string` one is required is also an error,
not a silent widening.

Everything the layer reads or writes goes through these accessors. There is no string
lookup anywhere, and no `any` in either file.

### 3.3 The config type

```ts
export type ListScreenConfig<
  TSearch extends object, TData, TRow,
  TSortField extends Extract<keyof TRow, string>,      // a sort field must be a real column
  TFilterValues extends object,
  TForm extends ListFilterForm<TFilterValues>,
  TQueryKey extends QueryKey,
> = {
  useRoute: () => ListRoute<TSearch>;
  query: {
    options: (search: TSearch) => UseSuspenseQueryOptions<TData, Error, TData, TQueryKey>;
    rows: (data: TData) => TRow[];
    total: (data: TData) => number;
  };
  sort:   { field: SearchField<TSearch, TSortField>; direction: SearchField<TSearch, SortDirection> };
  paging: { page: SearchField<TSearch, number>; pageSize: SearchField<TSearch, number> };
  filters: {
    empty: TFilterValues;
    fields: { [TKey in keyof TFilterValues]: SearchField<TSearch, TFilterValues[TKey]> };
    useForm: (defaults: TFilterValues, onSubmit: (v: TFilterValues) => void) => TForm;
  };
};
```

`filters.fields` is a **mapped type over the form's own value type**: exactly one accessor
per form field, no more, no fewer. A missing key, an extra key, or a misspelt key is a
compile error at the config literal.

`useRoute` is how the layer stays inside `shared`: the feature writes a ten-line hook where
the literal route id is known, so `shared` never handles a route-id string and the router
keeps typing `search`.

### 3.4 The users-list config (the ~40-line example)

From `src/features/users/screens/UserList/__prototype__/userListScreenConfig.ts`
(imports elided):

```ts
type UserListSearch = z.infer<typeof userListSearchSchema>;

const routeApi = getRouteApi('/mainLayout/protectedLayout/users');

const useUserListRoute = (): ListRoute<UserListSearch> => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  return {
    search,
    navigate: (update) => {
      navigate({ search: (previous: UserListSearch) => update(previous) });
    },
  };
};

const field = searchFields<UserListSearch>();

export const userListScreenConfig = defineListScreen<
  UserListSearch,
  UserListResponse,
  User,
  UserSortField,
  UserFilterFormValues,
  UserFilterForm
>()({
  useRoute: useUserListRoute,
  query: {
    options: (search) => userListQueryOptions(search),   // the entity's real factory
    rows: (data) => data.users,
    total: (data) => data.total,
  },
  sort: { field: field('sort'), direction: field('direction') },
  paging: { page: field('page'), pageSize: field('pageSize') },
  filters: {
    empty: emptyUserFilterFormValues,
    fields: {
      search: field('search'),
      role: field('role'),
      status: field('status'),
      department: field('department'),
    },
    useForm: useUserFilterForm,
  },
});
```

The `defineListScreen<…>()({…})` double call is not decoration. TypeScript cannot infer
`TRow`/`TSortField` from a config literal (they are only reachable through `SearchField`'s
invariant positions), so those six arguments are explicit; but `TQueryKey` *must* be
inferred, because `userListQueryOptions` carries a literal key tuple
(`readonly ['users', 'list', UserListParams]`) that is not assignable to the general
`QueryKey` in `queryFn`'s contravariant context parameter. Explicit-or-nothing type
arguments force the currying. This is the single ugliest thing in the design and it is
caused by real variance, not by taste.

### 3.5 The ViewModel (the answer to C2 and C5)

`useUserListViewModelFromConfig.ts`, 24 effective lines:

```ts
export const useUserListViewModelFromConfig = (): UserListViewProps => {
  const list = useListScreen(userListScreenConfig);
  const { data: filterOptions } = useSuspenseQuery(userFilterOptionsQueryOptions());

  return {
    users: list.rows, total: list.total, sort: list.sort,
    page: list.page, pageSize: list.pageSize, isFetching: list.isFetching,
    onSortChange: list.onSortChange, onPageChange: list.onPageChange,
    onPageSizeChange: list.onPageSizeChange,
    form: list.form, filterOptions,
    hasActiveFilters: list.hasActiveFilters, onClearFilters: list.onClearFilters,
  };
};
```

Its declared return type is `UserListViewProps` — the View's own type, imported as a type
— so drift is a compile error, exactly as decision 8 requires. It is an ordinary hook. No
context, no provider, no registry.

## 4. Evidence

Everything here is reproducible on this branch.

### C1 — typed end to end, a typo is a compile error

`git grep -n ': any\|as any' src/shared/screen-config src/features/.../__prototype__` returns
nothing. The layer contains exactly one type assertion, and it is about `Object.keys`
(which TypeScript deliberately types `string[]`), not about the config:

```ts
const objectKeys = <TObject extends object>(source: TObject): (keyof TObject)[] =>
  Object.keys(source) as (keyof TObject)[];
```

No value is ever looked up by a name the type system has not already checked.

**The compile-error demo.** Changing one character — `field('sort')` → `field('srot')` —
and running `npm run typecheck` produces three errors. The useful one is third:

```
userListScreenConfig.ts(55,24): error TS2345: Argument of type '"srot"' is not assignable
  to parameter of type 'requiredKeys<baseObjectOutputType<{ sort: ZodCatch<ZodEnum<["firstName",
  "email", "department", "role", "status"]>>; direction: ZodCatch<ZodEnum<["asc","desc"]>>;
  ... 5 more ...; department: ZodCatch<...>; }>>'.
```

Binding a filter field to the wrong key — `search: field('role')` — is caught by the
mapped type's invariance:

```
userListScreenConfig.ts(60,7): error TS2322: Type 'SearchField<{…}, "" | … 4 more … | "viewer">'
  is not assignable to type 'SearchField<{…}, string>'.
  Types of property 'write' are incompatible.
```

And a typo in a row accessor is caught at the data-layer boundary:

```
userListScreenConfig.ts(52,26): error TS2551: Property 'user' does not exist on type
  '{ users: {…}[]; total: number; }'. Did you mean 'users'?
```

**Honest caveats, both verified by mutating the config and running `tsc`:**

1. The *first two* of those three errors are cascades. The first is a nine-line wall about
   `QueryFunction<…, readonly unknown[], never>` and `queryKey` tuple arity that never
   mentions the typo — a one-character mistake anywhere in the config breaks `TQueryKey`
   inference and produces that wall. In an editor you see the wall first.
2. **Swapping two keys of the same type compiles silently.** Setting
   `paging: { page: field('pageSize'), pageSize: field('page') }` *and*
   `search: field('department'), department: field('search')` at once produces **no
   error at all**. The types check that a key exists and has the right shape; they
   cannot check that it means the right thing. This is a weaker guarantee than it first
   looks, and it is the same *class* of mistake as the original `sortingState` /
   `sortConfig` bug — narrower, but not eliminated. A hand-written ViewModel has the
   identical exposure; the config does not make it worse, but it does not fix it either.

### C2 — a plain hook, called once

`git grep -n createContext src/shared/screen-config` returns nothing. Proved by test:

- `viewModelParity.test.ts › config-driven ViewModel invocation cost › is invoked exactly
  as often as the hand-written ViewModel`

### C5 / acceptance criterion 2 — the same View props, the same View, the same tests

`viewModelParity.test.ts` runs the **nine behaviours of the existing
`useUserListViewModel.test.ts`** through `describe.each` over both implementations, typed
`[string, () => UserListViewProps][]`. 18 tests, all passing, e.g.:

```
✓ hand-written UserList ViewModel › navigates to the new sort and resets to page 1 …
✓ config-driven UserList ViewModel › navigates to the new sort and resets to page 1 …
✓ config-driven UserList ViewModel › clearing filters removes them from the URL, resets …
```

`viewParity.test.tsx` renders the **real, unmodified `UserListView`** with the
config-driven ViewModel's output (4 tests), including a click on the View's own column
header travelling back into the config-driven ViewModel:

```
✓ a click on the View's column header reaches the config-driven ViewModel
✓ a click on the View's next-page button reaches the config-driven ViewModel
```

The existing `UserListView.test.tsx` needs nothing: it feeds `UserListViewProps` by hand,
and the config-driven ViewModel's return type *is* `UserListViewProps`. That is the proof
that the View and its tests cannot tell the difference.

### C3 / C4 — opt-in and deletable

`src/app/router` still wires `UserList`, whose `index.tsx` calls the hand-written
ViewModel. The layer is reached only from `__prototype__/`.

Deleting **both** folders and running `npm run validate`: **green**, 27 files / 188 tests
(with the prototype: 29 files / 210 tests). Tried, then restored.

## 5. What the layer cannot express

This list is the honest boundary. In every case the fallback is the same and costs
nothing: **the screen simply does not opt in.** Hand-written is the default, the layer is
a hook, and a screen that calls `useListScreen` for the list mechanics may still override
any handler in its own glue — the glue is plain code, not a config slot. There is no
"escape hatch" to design because there is no framework to escape from.

1. **Columns and bespoke cell renderers.** `UserListView` owns its `columns`, including the
   name cell's `<Link to="/users/$userId">`. The layer produces props, never markup. Pushing
   columns into config would put JSX and `<Link>` into a config object and turn the View
   back into a one-line template wrapper — precisely defect C5. *Deliberately out of scope.*
2. **The detail / edit screen.** `UserDetailViewProps` is `{ title, sections, isEditing,
   isSaving, saveError, form, onBack, onEdit, onCancel }`, driven by
   `userUpdateMutationOptions` with optimistic update and rollback, an edit-mode toggle,
   and a form seeded from server data. The layer models no mutation, no local mode state,
   and no route params. *Not expressible, and should not be.* This is the screen that broke
   the previous layer, and it stays hand-written (89 lines today).
3. **Cross-field and derived filters.** `filters.fields` is one form field ↔ one search key.
   A date range writing `from` and `to`, or an `activeOnly: boolean` deriving
   `status: 'active' | ''`, does not fit the mapped type. Widening it to a pair of
   `fromSearch` / `toSearch` lambdas would work — and would be the hand-written mapping
   again, wearing a config's clothes.
4. **More than one query.** The users list has a second query (filter options). It lives in
   the feature glue. Anything beyond one list query is hand-written.
5. **Row selection, bulk actions, expandable rows, infinite scroll, column visibility.**
   Not modelled at all.
6. **A different page-reset policy.** "Reset to page 1 on sort, page-size and filter change"
   is hardcoded in the layer. A screen wanting otherwise must fork it or add an option —
   and options are how the previous layer grew.
7. **`hasActiveFilters` semantics.** The layer defines it as "some filter differs from
   `empty`". That matches the hand-written `Boolean(a || b || c || d)` here only because
   every empty value is `''`.

## 6. Cost and benefit, with the prototype's numbers

Counts are non-blank, non-comment lines; raw line counts in brackets.
`useUserFilterForm.ts` is shared by both implementations and excluded.

| | Effective LOC |
| --- | --- |
| Hand-written `useUserListViewModel.ts` | **79** [95] |
| Config-driven, per screen: `userListScreenConfig.ts` | 53 [67] |
| Config-driven, per screen: `useUserListViewModelFromConfig.ts` | 24 [39] |
| **Config-driven, per screen, total** | **77** [106] |
| Generic layer: `listScreenConfig.ts` | 105 [175] |
| Generic layer: `useListScreen.ts` | 99 [144] |
| **Generic layer, amortised** | **204** [319] |

**The per-screen saving is two lines (77 vs 79), or −2.5%.** Amortising the layer:
`204 + 77N < 79N` requires **N > 102 list screens**. On measured numbers the layer never
pays for itself.

The most generous possible reading: count only the declarative config literal (19 effective
lines) against the whole hand-written ViewModel (79), and pretend the imports, the route
hook, the six explicit type arguments and the props glue (58 lines) would disappear. Then
break-even is `204 / 60 ≈ 4` screens. That comparison is unfair — those 58 lines are real
and irreducible — but it brackets the honest answer: **somewhere between 4 and never,
and the measured value is "never".**

### Type complexity

- `ListScreenConfig` takes **7 type parameters**; `useListScreen` takes 7.
- `defineListScreen` is **curried in two phases** for variance reasons (§3.4).
- Each config site names **6 type arguments explicitly**.
- **Zero `any`**, one `Object.keys` assertion.
- One TanStack Query minor-version detail (query-key tuple variance) is baked into the
  config type's signature. Every future bump lands here first.

### Test story

- 19 prototype ViewModel tests (9 behaviours × 2 implementations + 1 invocation-cost test)
  and 4 View-parity tests: **23 added, all green**.
- `npm run validate`: **210 tests, 29 files, green** with the prototype present.
- **Coverage: 100 % statements / branches / functions / lines** on both
  `src/shared/screen-config/` and `.../UserList/__prototype__/`.
  **No threshold exclusions were needed; `vitest.config.ts` is unmodified.**
  (`npm run validate` runs `vitest run`, not `--coverage`; `npx vitest run --coverage` was
  checked separately.)
- Honest cost: a generic layer has to be tested **twice** — once as a generic and once per
  screen — or its bugs are invisible. The prototype only does the second. A production
  version would need its own unit tests for `searchFields`, the filter round-trip and the
  page-reset policy, adding perhaps another 150 lines of test.

### Lint-boundary placement

`src/shared/screen-config/` is the right home and **needed no ESLint change**: it already
matches the existing element `{ type: 'shared', pattern: 'src/shared/*', mode: 'folder' }`,
so `boundaries/element-types` treats it as `shared` and forbids it from importing any
feature. Verified by `npm run validate` passing, and by inspection — the layer imports only
`react`, `@tanstack/react-query` and its own sibling module.

**Yes, `shared` stays free of feature imports** — but not for free. Because `shared` cannot
see `User`, `UserSortField`, `UserListViewProps` or a route id, the design pays for the
boundary three times: `SortDirection` is re-declared in `shared`; the route binding must be
a feature-supplied `useRoute` hook; and the props mapping must be feature-side glue. Those
three concessions *are* most of the 58 irreducible lines above. The boundary is not the
problem — it is doing its job — but it is why a config layer cannot be as thin here as it
would be in a codebase without decision 6.

One gap if adopted: the View's `no-restricted-imports` rule does not currently list
`@/shared/screen-config`, so nothing stops a View importing a config. It should be added.

### Benefits, stated fairly

1. **Cross-cutting list rules written once.** "Reset to page 1" appears **4 times** in the
   hand-written ViewModel, and the URL↔draft-form `useEffect` is hand-rolled with an
   `eslint-disable` for its dependency array. A second list screen copies both, including
   the `eslint-disable`. The layer writes them once.
2. **A config reads as a summary of the screen** — 19 lines saying which query, which keys,
   which filters. That is genuinely nicer than 79 lines of imperative mapping.
3. **Genuinely opt-in and deletable** (proved), and **genuinely typed** (proved).

## 7. Risks

1. **Gravity (the return of C4).** Nothing in the code stops the config becoming the default
   again; only culture does. The previous layer failed exactly this way. Adopting this one
   means amending CLAUDE.md rules 1 and 9 from "no config-driven layer" to "config is
   optional", and then holding that line in review forever. That is the single largest risk
   and it is unmeasurable.
2. **Silent mis-binding of same-typed keys** (proved in §4). Narrower than the original
   `any` dispatch, not gone.
3. **Error-message cliff** (proved in §4). One typo ⇒ three errors, the useful one third.
4. **Option creep.** The moment a second list screen wants a different page-reset policy or
   a cross-field filter, the config grows an option. Options are how the previous layer
   became unusable. There is no evidence this one would resist that pressure; there is only
   one screen.
5. **Two things to maintain.** Every list screen bug now has two possible homes.
6. **N = 1.** The layer is generic over exactly one screen. Every generalisation in it is a
   guess about screens that do not exist. The second list screen is far more likely to
   reveal that the abstraction is wrong than to fit it.

## 8. The cheaper alternative

Benefit 1 — the only benefit with real duplication behind it — does not need a config layer.
Decision 3 already names `shared/hooks` as the home for cross-cutting behaviour. Two small
composables would capture it:

- `useUrlListState(routeApi, keys)` — page / pageSize / sort handlers with the page-reset
  policy, ~40 lines.
- `useUrlSyncedFilterForm(...)` — the draft-form ↔ URL `useEffect`, its fingerprint
  dependency and the `eslint-disable`, in one audited place, ~30 lines.

That is ~70 lines instead of 204, one generic parameter instead of seven, no currying, no
config indirection, no new way to build a screen, no CLAUDE.md amendment — and the
hand-written ViewModel stays readable top to bottom.

## 9. Recommendation

**Do not build the config-driven screen layer.**

The prototype proves it *can* be built cleanly — typed end to end with no `any`, producing
identical View props, opt-in, deletable, and with the removed version's five defects
answered. It does not show that it *should* be: the per-screen saving is two lines, the
amortised break-even is around a hundred list screens, the whole design is generalised from
a single example, and its one real benefit (cross-cutting list rules in one place) is
available for a third of the code as `shared/hooks` composables with none of the gravity
risk that killed the previous layer.

**Do instead:** when a second and third list screen arrive, extract the two composables in
§8. **Revisit this proposal only if all three hold:** (a) there are **≥ 5** list screens,
(b) they are genuinely uniform — same single query, one-to-one filters, no bespoke paging
policy, and (c) the `shared/hooks` composables have demonstrably failed to stop those
screens diverging. At that point the config layer would be generalising from evidence
instead of from one screen, and this branch is the starting point.

### Reasoning for the ADR, either way

**If the decision is "don't build" (recommended)** — ADR: *A config-driven screen layer is
not adopted.* Context: ADR 0001 parked it; issue #14 explored it with a working prototype.
Decision: hand-written hook ViewModels remain the only way to build a screen; cross-cutting
list behaviour goes to `shared/hooks`. Rationale: a fully-typed config costs 204 lines of
generic machinery to save two lines per screen, so it does not amortise before ~100 screens;
its benefits are obtainable from ~70 lines of composables; and re-introducing a config path
re-opens the pressure that made config the only way to build a screen (issue #1, decision 3),
which no type can prevent. Consequences: per-screen mapping code stays duplicated, and that
duplication is accepted as the cheaper of the two costs. Revisit trigger as above.

**If the decision is "build"** — ADR: *An opt-in config-driven list-screen layer.* Context
and decision as prototyped: a `shared/screen-config` layer producing a generic
`ListScreenState`, with each screen's ViewModel mapping it to its own `{Name}ViewProps`; the
layer holds real query-options factories and invariant typed accessors, never markup, never
a route id, never a string lookup. Rationale: it answers all five defects of the removed
version with compile-time checks and a deletability test. Consequences that must be recorded
honestly: CLAUDE.md rules 1 and 9 change from "no config-driven layer" to "config is an
optional layer, hand-written is the default"; the View `no-restricted-imports` rule gains
`@/shared/screen-config`; the layer needs its own unit tests as well as per-screen ones;
detail/edit screens, bespoke cell renderers, cross-field filters, multi-query screens and
selection remain hand-written by design; and swapping two same-typed search keys is still
not a compile error.
