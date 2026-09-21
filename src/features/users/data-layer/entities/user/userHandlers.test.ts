import { describe, expect, it } from 'vitest';

import { userFixtures } from './userFixtures';

describe('userHandlers', () => {
  it('defaults to firstName ascending, page 1, page size 10 when no query params are given', async () => {
    const response = await fetch('/api/users');
    const payload = (await response.json()) as { users: { firstName: string }[]; total: number };

    expect(payload.total).toBe(userFixtures.length);
    expect(payload.users).toHaveLength(10);
    expect(payload.users[0]?.firstName).toBe('Ada');
  });
});
