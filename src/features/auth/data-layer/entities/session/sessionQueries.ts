import { mutationOptions } from '@tanstack/react-query';

import { useSessionStore } from '@/shared/stores/sessionStore';

import { type LoginCredentials, login } from './sessionApi';

export const sessionMutations = {
  login: () =>
    mutationOptions({
      mutationFn: (credentials: LoginCredentials) => login(credentials),
      onSuccess: (session) => {
        useSessionStore.getState().setSession(session.user, session.token);
      },
    }),
};
