import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';

import { fetchUserDetail, fetchUserList } from './userApi';
import { userFixtures } from './userFixtures';

describe('fetchUserList', () => {
  it('returns the users the API responded with', async () => {
    await expect(fetchUserList()).resolves.toEqual(userFixtures);
  });

  it('throws a readable error when the response payload does not match the schema', async () => {
    server.use(
      http.get('*/api/users', () => HttpResponse.json([{ id: 'USR-001', role: 'wizard' }])),
    );

    await expect(fetchUserList()).rejects.toThrow(/user list.*did not match the expected shape/i);
  });

  it('names the offending fields when the response payload does not parse', async () => {
    server.use(
      http.get('*/api/users', () => HttpResponse.json([{ id: 'USR-001', role: 'wizard' }])),
    );

    await expect(fetchUserList()).rejects.toThrow(/0\.role/);
  });

  it('throws when the request fails', async () => {
    server.use(http.get('*/api/users', () => new HttpResponse(null, { status: 500 })));

    await expect(fetchUserList()).rejects.toThrow(/500/);
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
