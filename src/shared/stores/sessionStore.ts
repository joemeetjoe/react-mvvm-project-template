import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
