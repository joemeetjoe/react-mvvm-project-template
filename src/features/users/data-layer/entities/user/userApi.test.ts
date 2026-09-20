import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';

import { fetchUserList } from './userApi';
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
});
