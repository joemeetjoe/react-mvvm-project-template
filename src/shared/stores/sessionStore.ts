import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * A duplicate of `features/auth`'s session user shape (decision 6): shared
 * code may not import a feature, so this store defines its own minimal
 * contract instead of importing the auth entity's schema type.
 */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

type SessionState = {
  user: SessionUser | null;
  token: string | null;
  setSession: (user: SessionUser, token: string) => void;
  clearSession: () => void;
};

const initialState: Pick<SessionState, 'user' | 'token'> = {
  user: null,
  token: null,
};

/**
 * The single source of truth for "who is signed in", read directly (via
 * `getState`/the hook) by the route guard, the HTTP wrapper and the navbar
 * (decision 6) so none of them need to import `features/auth`.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (user, token) => set({ user, token }),
      clearSession: () => set(initialState),
    }),
    { name: 'session-store' },
  ),
);
