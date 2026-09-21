import { afterEach, describe, expect, it } from 'vitest';

import { type SessionUser, useSessionStore } from './sessionStore';

const user: SessionUser = { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' };

afterEach(() => {
  useSessionStore.getState().clearSession();
});

describe('useSessionStore', () => {
  it('starts signed out', () => {
    expect(useSessionStore.getState()).toMatchObject({ user: null, token: null });
  });

  it('setSession stores the user and token', () => {
    useSessionStore.getState().setSession(user, 'test-token');

    expect(useSessionStore.getState()).toMatchObject({ user, token: 'test-token' });
  });

  it('clearSession resets the user and token', () => {
    useSessionStore.getState().setSession(user, 'test-token');
    useSessionStore.getState().clearSession();

    expect(useSessionStore.getState()).toMatchObject({ user: null, token: null });
  });

  it('persists the session to storage', () => {
    useSessionStore.getState().setSession(user, 'test-token');

    const persisted = window.localStorage.getItem('session-store');
    expect(persisted).toContain('test-token');
  });
});
