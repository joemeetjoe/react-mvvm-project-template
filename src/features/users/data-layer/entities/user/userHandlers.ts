import { HttpResponse, http } from 'msw';

import type { SortDirection, User, UserSortField } from './userSchema';
import { userFixtures } from './userFixtures';

const compareUsers =
  (field: UserSortField, direction: SortDirection) =>
  (a: User, b: User): number => {
    const result = String(a[field]).localeCompare(String(b[field]));

    return direction === 'desc' ? -result : result;
  };

/**
 * A mutable copy of the fixtures backing the list/detail/update handlers, so
 * a successful edit is visible both to the GET detail that runs after cache
 * invalidation and to the list — mirroring a real backend.
 */
let userStore: User[] = userFixtures.map((user) => ({ ...user }));

const findStoredUser = (id: string): User | undefined =>
  userStore.find((candidate) => candidate.id === id);

/** Restores the mutable store to the original fixtures; call between tests that PATCH. */
export const resetUserFixtures = (): void => {
  userStore = userFixtures.map((user) => ({ ...user }));
};

/**
 * Shared by the test server (`shared/testing/server`) and, from #10, the
 * dev-mode browser worker. Honours `sort`, `direction`, `page` and `pageSize`
 * query params — fixing the bug where sorting never reached the handler.
 */
export const userHandlers = [
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const sort = (url.searchParams.get('sort') ?? 'firstName') as UserSortField;
    const direction = (url.searchParams.get('direction') ?? 'asc') as SortDirection;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    const sorted = [...userStore].sort(compareUsers(sort, direction));
    const start = (page - 1) * pageSize;
    const users = sorted.slice(start, start + pageSize);

    return HttpResponse.json({ users, total: userStore.length });
  }),
  http.get('*/api/users/:id', ({ params }) => {
    const user = findStoredUser(params.id as string);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
  http.patch('*/api/users/:id', async ({ params, request }) => {
    const user = findStoredUser(params.id as string);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    const update = (await request.json()) as Partial<User>;
    const updated: User = { ...user, ...update, updatedAt: new Date().toISOString() };

    userStore = userStore.map((candidate) => (candidate.id === updated.id ? updated : candidate));

    return HttpResponse.json(updated);
  }),
];
