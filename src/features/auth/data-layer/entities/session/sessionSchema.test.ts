import { describe, expect, it } from 'vitest';

import { loginCredentialsSchema, sessionSchema, sessionUserSchema } from './sessionSchema';

const validUser = { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' };
const validSession = { user: validUser, token: 'test-token' };

describe('sessionUserSchema', () => {
  it('accepts a well-formed session user', () => {
    expect(sessionUserSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects a role that is not admin or user', () => {
    expect(() => sessionUserSchema.parse({ ...validUser, role: 'manager' })).toThrow();
  });

  it('rejects a user whose email is not an email address', () => {
    expect(() => sessionUserSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow();
  });

  it('rejects a user with a missing required field', () => {
    const { name: _name, ...withoutName } = validUser;

    expect(() => sessionUserSchema.parse(withoutName)).toThrow();
  });
});

describe('sessionSchema', () => {
  it('accepts a well-formed session', () => {
    expect(sessionSchema.parse(validSession)).toEqual(validSession);
  });

  it('rejects a session with an empty token', () => {
    expect(() => sessionSchema.parse({ ...validSession, token: '' })).toThrow();
  });

  it('rejects a session with a missing user', () => {
    const { user: _user, ...withoutUser } = validSession;

    expect(() => sessionSchema.parse(withoutUser)).toThrow();
  });
});

describe('loginCredentialsSchema', () => {
  const validCredentials = { email: 'admin@example.com', password: 'password' };

  it('accepts an email address and a non-empty password', () => {
    expect(loginCredentialsSchema.parse(validCredentials)).toEqual(validCredentials);
  });

  it('rejects an email that is not an email address', () => {
    expect(() => loginCredentialsSchema.parse({ ...validCredentials, email: 'nope' })).toThrow();
  });

  it('rejects an empty password', () => {
    expect(() => loginCredentialsSchema.parse({ ...validCredentials, password: '' })).toThrow();
  });
});
