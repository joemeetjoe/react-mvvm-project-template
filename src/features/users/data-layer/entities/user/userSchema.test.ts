import { describe, expect, it } from 'vitest';

import { userListSchema, userSchema } from './userSchema';

const validUser = {
  id: 'USR-001',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.lovelace@example.com',
  role: 'admin',
  status: 'active',
  department: 'Engineering',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-11-20T14:30:00Z',
};

describe('userSchema', () => {
  it('accepts a well-formed user', () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects a user whose role is not one of the known roles', () => {
    expect(() => userSchema.parse({ ...validUser, role: 'wizard' })).toThrow();
  });

  it('rejects a user whose email is not an email address', () => {
    expect(() => userSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow();
  });

  it('rejects a user with a missing required field', () => {
    const { department: _department, ...withoutDepartment } = validUser;

    expect(() => userSchema.parse(withoutDepartment)).toThrow();
  });
});

describe('userListSchema', () => {
  it('accepts an array of well-formed users', () => {
    expect(userListSchema.parse([validUser])).toEqual([validUser]);
  });

  it('rejects a payload that is not an array', () => {
    expect(() => userListSchema.parse({ data: [validUser] })).toThrow();
  });
});
