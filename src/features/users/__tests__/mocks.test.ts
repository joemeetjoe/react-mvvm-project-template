import { describe, it, expect } from 'vitest';
import { mockUsers } from '../model/mocks/users';
import { mockFilterOptions } from '../model/mocks/filterOptions';

describe('Users Mock Data', () => {
  it('should have at least 10 mock users', () => {
    expect(mockUsers.length).toBeGreaterThanOrEqual(10);
  });

  it('should have valid user fields', () => {
    mockUsers.forEach((user) => {
      expect(user.id).toBeTruthy();
      expect(user.firstName).toBeTruthy();
      expect(user.lastName).toBeTruthy();
      expect(user.email).toContain('@');
      expect(['admin', 'user', 'manager', 'editor', 'viewer']).toContain(user.role);
      expect(['active', 'inactive', 'pending']).toContain(user.status);
    });
  });

  it('should have unique IDs', () => {
    const ids = mockUsers.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique emails', () => {
    const emails = mockUsers.map((u) => u.email);
    expect(new Set(emails).size).toBe(emails.length);
  });
});

describe('Users Filter Options', () => {
  it('should have role options', () => {
    expect(mockFilterOptions.role.length).toBeGreaterThan(0);
  });

  it('should have status options', () => {
    expect(mockFilterOptions.status.length).toBeGreaterThan(0);
  });

  it('should have department options', () => {
    expect(mockFilterOptions.department.length).toBeGreaterThan(0);
  });
});
