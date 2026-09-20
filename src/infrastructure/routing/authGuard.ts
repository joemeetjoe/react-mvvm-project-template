import { type ParsedLocation, redirect } from '@tanstack/react-router';

import { useSessionStore } from '@/shared/stores/sessionStore';

/**
 * Reads the shared session store (decision 6) rather than a feature's store,
 * so this guard never imports `features/auth`.
 */
export const authGuard = (location: ParsedLocation): Record<string, never> => {
  const { token } = useSessionStore.getState();

  if (!token) {
    throw redirect({
      to: '/',
      search: { redirect: location.href },
    });
  }

  return {};
};
