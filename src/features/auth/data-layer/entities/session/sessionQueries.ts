import { mutationOptions } from '@tanstack/react-query';

import { useSessionStore } from '@/shared/stores/sessionStore';

import { type LoginCredentials, login } from './sessionApi';

/**
 * Writing the returned session into the shared store lives here, in the
 * mutation options, not in the ViewModel (decision 8).
 */
export const sessionMutations = {
  login: () =>
    mutationOptions({
      mutationFn: (credentials: LoginCredentials) => login(credentials),
      onSuccess: (session) => {
        useSessionStore.getState().setSession(session.user, session.token);
      },
    }),
};
