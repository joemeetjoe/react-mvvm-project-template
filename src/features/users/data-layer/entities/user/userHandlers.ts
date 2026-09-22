import { HttpResponse, http } from 'msw';
import { z } from 'zod';

import {
  type SortDirection,
  type User,
  type UserSortField,
  userRoles,
  userSortFields,
  userStatuses,
} from './userSchema';
import { userFixtures } from './userFixtures';

// Mirrors the route's search schema: an unknown value falls back to the default.
const sortParamSchema = z.enum(userSortFields).catch('firstName');
const directionParamSchema = z.enum(['asc', 'desc']).catch('asc');

const compareUsers =
  (field: UserSortField, direction: SortDirection) =>
  (a: User, b: User): number => {
    const result = String(a[field]).localeCompare(String(b[field]));

    return direction === 'desc' ? -result : result;
  };

let userStore: User[] = userFixtures.map((user) => ({ ...user }));

const findStoredUser = (id: string): User | undefined =>
  userStore.find((candidate) => candidate.id === id);

export const resetUserFixtures = (): void => {
  userStore = userFixtures.map((user) => ({ ...user }));
};

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

export const userHandlers = [
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const sort = sortParamSchema.parse(url.searchParams.get('sort'));
    const direction = directionParamSchema.parse(url.searchParams.get('direction'));
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const role = url.searchParams.get('role') ?? '';
    const status = url.searchParams.get('status') ?? '';
    const department = url.searchParams.get('department') ?? '';

    const filtered = userStore.filter((user) =>
      matchesFilters(user, { search, role, status, department }),
    );
    const sorted = [...filtered].sort(compareUsers(sort, direction));
    const start = (page - 1) * pageSize;
    const users = sorted.slice(start, start + pageSize);

    return HttpResponse.json({ users, total: filtered.length });
  }),

  http.get('*/api/users/filter-options', () => {
    const departments = [...new Set(userStore.map((user) => user.department))].sort();
    return HttpResponse.json({ roles: userRoles, statuses: userStatuses, departments });
  }),
  
  http.get('*/api/users/:id', ({ params }) => {
    const user = findStoredUser(params.id as string);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.patch('*/api/users/:id', async ({ params, request }) => {
    const user = findStoredUser(params.id as string);
    if (!user) return new HttpResponse(null, { status: 404 });
 
    const update = (await request.json()) as Partial<User>;
    const updated: User = { ...user, ...update, updatedAt: new Date().toISOString() };

    userStore = userStore.map((candidate) => (candidate.id === updated.id ? updated : candidate));
    return HttpResponse.json(updated);
  }),

];
