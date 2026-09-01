import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, createUsers, resetUserIdCounter } from '../userBuilders';

describe('userBuilders', () => {
  beforeEach(() => {
    resetUserIdCounter();
  });

  it('should create a user with default values', () => {
    const user = createUser();
    expect(user.id).toBe('user-1');
    expect(user.firstName).toBe('First1');
    expect(user.email).toBe('user1@example.com');
    expect(user.role).toBe('user');
    expect(user.status).toBe('active');
  });

  it('should allow overrides', () => {
    const user = createUser({ firstName: 'John', role: 'admin' });
    expect(user.firstName).toBe('John');
    expect(user.role).toBe('admin');
  });

  it('should create multiple users with unique IDs', () => {
    const users = createUsers(5);
    expect(users).toHaveLength(5);
    const ids = users.map((u) => u.id);
    expect(new Set(ids).size).toBe(5);
  });
});
