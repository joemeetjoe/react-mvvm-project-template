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

  it('filters by a case-insensitive search on name and email', async () => {
    const response = await fetch('/api/users?search=ADA');
    const payload = (await response.json()) as { users: { firstName: string }[]; total: number };

    expect(payload.total).toBe(1);
    expect(payload.users[0]?.firstName).toBe('Ada');
  });

  it('filters by role', async () => {
    const response = await fetch('/api/users?role=admin');
    const payload = (await response.json()) as { users: { role: string }[]; total: number };

    expect(payload.users.every((user) => user.role === 'admin')).toBe(true);
    expect(payload.total).toBeGreaterThan(0);
  });

  it('filters by status', async () => {
    const response = await fetch('/api/users?status=pending');
    const payload = (await response.json()) as { users: { status: string }[]; total: number };

    expect(payload.users.every((user) => user.status === 'pending')).toBe(true);
    expect(payload.total).toBeGreaterThan(0);
  });

  it('filters by department', async () => {
    const response = await fetch('/api/users?department=Operations');
    const payload = (await response.json()) as { users: { department: string }[]; total: number };

    expect(payload.users.every((user) => user.department === 'Operations')).toBe(true);
    expect(payload.total).toBeGreaterThan(0);
  });

  it('combines filters and reports the filtered total, not the full fixture count', async () => {
    const response = await fetch('/api/users?role=admin&status=inactive');
    const payload = (await response.json()) as { users: { id: string }[]; total: number };

    expect(payload.total).toBe(payload.users.length);
    expect(payload.total).toBeLessThan(userFixtures.length);
  });

  it('returns an empty page when no user matches the filters', async () => {
    const response = await fetch('/api/users?search=nobody-like-this');
    const payload = (await response.json()) as { users: unknown[]; total: number };

    expect(payload.users).toHaveLength(0);
    expect(payload.total).toBe(0);
  });
});

describe('filter-options handler', () => {
  it('returns the known roles, statuses and the distinct departments in the fixtures', async () => {
    const response = await fetch('/api/users/filter-options');
    const payload = (await response.json()) as {
      roles: string[];
      statuses: string[];
      departments: string[];
    };

    expect(payload.roles).toEqual(expect.arrayContaining(['admin', 'user', 'manager']));
    expect(payload.statuses).toEqual(expect.arrayContaining(['active', 'inactive', 'pending']));
    expect(new Set(payload.departments).size).toBe(payload.departments.length);
    expect(payload.departments).toEqual(expect.arrayContaining(['Engineering', 'Operations', 'Research']));
  });
});
