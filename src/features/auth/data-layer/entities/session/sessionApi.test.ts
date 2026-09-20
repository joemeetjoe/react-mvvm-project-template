import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';

import { login } from './sessionApi';
import { sessionFixtures } from './sessionFixtures';

describe('login', () => {
  it('returns the session for known credentials', async () => {
    await expect(login({ email: 'admin@example.com', password: 'anything' })).resolves.toEqual(
      sessionFixtures[0],
    );
  });

  it('throws when the credentials are not recognised', async () => {
    await expect(login({ email: 'nobody@example.com', password: 'anything' })).rejects.toThrow(
      /401/,
    );
  });

  it('throws a readable error when the response payload does not match the schema', async () => {
    server.use(http.post('*/api/login', () => HttpResponse.json({ user: { id: '1' } })));

    await expect(login({ email: 'admin@example.com', password: 'x' })).rejects.toThrow(
      /login.*did not match the expected shape/i,
    );
  });
});
