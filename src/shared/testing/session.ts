// TEMPORARY: the session still lives in the legacy auth store. Decision 6 moves
// it to `shared/stores`; until the auth slice lands, this is the one place the
// test renderer reaches into legacy code.
import { type AuthUser, useAuthStore } from '@/infrastructure/stores/useAuthStore';

export type Session = {
  user: AuthUser;
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

  useAuthStore.setState(
    resolved === null
      ? { user: null, token: null, isAuthenticated: false }
      : { user: resolved.user, token: resolved.token, isAuthenticated: true },
  );
};
