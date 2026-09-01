import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const mockUsers: AuthUser[] = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'user@example.com', name: 'Regular User', role: 'user' },
];

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        login: async (email: string, _password: string) => {
          set({ isLoading: true, error: null }, false, 'login/start');

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));

          const user = mockUsers.find(u => u.email === email);
          if (!user) {
            set({ isLoading: false, error: 'Invalid credentials' }, false, 'login/error');
            throw new Error('Invalid credentials');
          }

          const fakeToken = btoa(
            JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 3600000 })
          );

          set(
            { user, token: fakeToken, isAuthenticated: true, isLoading: false, error: null },
            false,
            'login/success'
          );
        },

        logout: () => {
          set(initialState, false, 'logout');
        },

        clearError: () => {
          set({ error: null }, false, 'clearError');
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore', enabled: import.meta.env.DEV }
  )
);
