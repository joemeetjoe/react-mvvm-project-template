import { type ParsedLocation, redirect } from '@tanstack/react-router';

import { useSessionStore } from '@/shared/stores/sessionStore';

// Returns `void` rather than `Record<string, never>`, which made `context` infer as `never` on child routes using `validateSearch`.
export const authGuard = (location: ParsedLocation): void => {
  const { token } = useSessionStore.getState();

  if (!token) {
    throw redirect({
      to: '/',
      search: { redirect: location.href },
    });
  }
};
