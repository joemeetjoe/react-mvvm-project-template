import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';

import { fetchUserDetail, fetchUserFilterOptions, fetchUserList } from './userApi';
import { userFixtures } from './userFixtures';

const defaultParams = { sort: 'firstName', direction: 'asc', page: 1, pageSize: 10 } as const;

describe('fetchUserList', () => {
  it('returns the first page of users sorted as requested', async () => {
    const { users, total } = await fetchUserList(defaultParams);

    expect(total).toBe(userFixtures.length);
    expect(users).toHaveLength(10);
    expect(users[0]?.firstName).toBe('Ada');
  });

  it('returns the second page when asked', async () => {
    const { users } = await fetchUserList({ ...defaultParams, page: 2 });

    expect(users).toHaveLength(5);
  });

  it('sorts descending when asked', async () => {
    const { users } = await fetchUserList({ ...defaultParams, direction: 'desc' });

    expect(users[0]?.firstName).toBe('Shafi');
  });

  it('sorts by a different field', async () => {
    const { users } = await fetchUserList({ ...defaultParams, sort: 'department' });

    expect(users[0]?.department).toBe('Engineering');
  });

  it('throws a readable error when the response payload does not match the schema', async () => {
    server.use(
      http.get('*/api/users', () =>
        HttpResponse.json({ users: [{ id: 'USR-001', role: 'wizard' }], total: 1 }),
      ),
    );

    await expect(fetchUserList(defaultParams)).rejects.toThrow(
      /user list.*did not match the expected shape/i,
    );
  });

  it('throws when the request fails', async () => {
    server.use(http.get('*/api/users', () => new HttpResponse(null, { status: 500 })));

    await expect(fetchUserList(defaultParams)).rejects.toThrow(/500/);
  });

  it('sends only the filters that are set', async () => {
    let requestedUrl = '';

    server.use(
      http.get('*/api/users', ({ request }) => {
        requestedUrl = request.url;

        return HttpResponse.json({ users: [], total: 0 });
      }),
    );

    await fetchUserList({ ...defaultParams, search: 'ada', role: 'admin' });

    const query = new URL(requestedUrl).searchParams;

    expect(query.get('search')).toBe('ada');
    expect(query.get('role')).toBe('admin');
    expect(query.get('status')).toBeNull();
    expect(query.get('department')).toBeNull();
  });

  it('sends the status and department filters when they are set', async () => {
    let requestedUrl = '';

    server.use(
      http.get('*/api/users', ({ request }) => {
        requestedUrl = request.url;

        return HttpResponse.json({ users: [], total: 0 });
      }),
    );

    await fetchUserList({ ...defaultParams, status: 'active', department: 'Engineering' });

    const query = new URL(requestedUrl).searchParams;

    expect(query.get('status')).toBe('active');
    expect(query.get('department')).toBe('Engineering');
  });
});

describe('fetchUserFilterOptions', () => {
  it('returns the roles, statuses and departments the API responds with', async () => {
    const options = await fetchUserFilterOptions();

    expect(options.roles).toContain('admin');
    expect(options.statuses).toContain('active');
    expect(options.departments).toContain('Engineering');
  });

  it('throws a readable error when the response payload does not match the schema', async () => {
    server.use(http.get('*/api/users/filter-options', () => HttpResponse.json({ roles: ['x'] })));

    await expect(fetchUserFilterOptions()).rejects.toThrow(
      /user filter options.*did not match the expected shape/i,
    );
  });
});

describe('fetchUserDetail', () => {
  it('returns the user the API responded with', async () => {
    await expect(fetchUserDetail('USR-001')).resolves.toEqual(userFixtures[0]);
  });

  it('throws a readable error when the response payload does not match the schema', async () => {
    server.use(
      http.get('*/api/users/:id', () => HttpResponse.json({ id: 'USR-001', role: 'wizard' })),
    );

    await expect(fetchUserDetail('USR-001')).rejects.toThrow(
      /user detail.*did not match the expected shape/i,
    );
  });

  it('throws when the user is not found', async () => {
    await expect(fetchUserDetail('USR-404')).rejects.toThrow(/404/);
  });
});
