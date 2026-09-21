import { type SessionUser, useSessionStore } from '@/shared/stores/sessionStore';

export type Session = {
  user: SessionUser;
  token: string;
};

export const signedInSession: Session = {
  user: { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  token: 'test-token',
};

/**
 * Seeds the session a test renders with. `undefined` means "signed in", which
 * is what almost every test wants; `null` renders signed out.
 */
export const applySession = (session: Session | null | undefined): void => {
  const resolved = session === undefined ? signedInSession : session;

  if (resolved === null) {
    useSessionStore.getState().clearSession();
    return;
  }

  useSessionStore.getState().setSession(resolved.user, resolved.token);
};
