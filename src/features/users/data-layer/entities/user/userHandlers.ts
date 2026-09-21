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

    const sorted = [...userFixtures].sort(compareUsers(sort, direction));
    const start = (page - 1) * pageSize;
    const users = sorted.slice(start, start + pageSize);

    return HttpResponse.json({ users, total: userFixtures.length });
  }),
  http.get('*/api/users/:id', ({ params }) => {
    const user = userFixtures.find((candidate) => candidate.id === params.id);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
];
