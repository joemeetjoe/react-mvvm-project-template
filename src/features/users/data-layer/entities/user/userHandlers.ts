import { HttpResponse, http } from 'msw';

import { type SortDirection, type User, type UserSortField, userRoles, userStatuses } from './userSchema';
import { userFixtures } from './userFixtures';

const compareUsers =
  (field: UserSortField, direction: SortDirection) =>
  (a: User, b: User): number => {
    const result = String(a[field]).localeCompare(String(b[field]));

    return direction === 'desc' ? -result : result;
  };

/**
 * Filters (issue #6). Every param is optional — an absent or empty one
 * matches every user, matching the route's "empty string = no filter"
 * search schema.
 */
const matchesFilters = (
  user: User,
  { search, role, status, department }: { search: string; role: string; status: string; department: string },
): boolean => {
  const haystack = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();

  return (
    (!search || haystack.includes(search)) &&
    (!role || user.role === role) &&
    (!status || user.status === status) &&
    (!department || user.department === department)
  );
};

/**
 * Shared by the test server (`shared/testing/server`) and, from #10, the
 * dev-mode browser worker. Honours `sort`, `direction`, `page`, `pageSize`
 * and the filter params — fixing the bug where sorting never reached the
 * handler.
 */
export const userHandlers = [
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const sort = (url.searchParams.get('sort') ?? 'firstName') as UserSortField;
    const direction = (url.searchParams.get('direction') ?? 'asc') as SortDirection;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const role = url.searchParams.get('role') ?? '';
    const status = url.searchParams.get('status') ?? '';
    const department = url.searchParams.get('department') ?? '';

    const filtered = userFixtures.filter((user) =>
      matchesFilters(user, { search, role, status, department }),
    );
    const sorted = [...filtered].sort(compareUsers(sort, direction));
    const start = (page - 1) * pageSize;
    const users = sorted.slice(start, start + pageSize);

    return HttpResponse.json({ users, total: filtered.length });
  }),
  http.get('*/api/users/filter-options', () => {
    const departments = [...new Set(userFixtures.map((user) => user.department))].sort();

    return HttpResponse.json({ roles: userRoles, statuses: userStatuses, departments });
  }),
  http.get('*/api/users/:id', ({ params }) => {
    const user = userFixtures.find((candidate) => candidate.id === params.id);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
];
