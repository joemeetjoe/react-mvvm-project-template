import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';

import { fetchUserList } from './userApi';
import { userFixtures } from './userFixtures';

describe('fetchUserList', () => {
  it('returns the users the API responded with', async () => {
    await expect(fetchUserList()).resolves.toEqual(userFixtures);
  });

  it('throws when the response payload does not match the schema', async () => {
    server.use(
      http.get('*/api/users', () => HttpResponse.json([{ id: 'USR-001', role: 'wizard' }])),
    );

    await expect(fetchUserList()).rejects.toThrow();
  });

  it('throws when the request fails', async () => {
    server.use(http.get('*/api/users', () => new HttpResponse(null, { status: 500 })));

    await expect(fetchUserList()).rejects.toThrow(/500/);
  });
});
