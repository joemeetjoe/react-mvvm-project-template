import { type ParsedLocation, redirect } from '@tanstack/react-router';

import { useSessionStore } from '@/shared/stores/sessionStore';

/**
 * Reads the shared session store (decision 6) rather than a feature's store,
 * so this guard never imports `features/auth`.
 *
 * Returns `void` rather than `Record<string, never>` (issue #5) — the latter
 * made `context` infer as `never` on child routes that also use
 * `validateSearch`.
 */
export const authGuard = (location: ParsedLocation): void => {
  const { token } = useSessionStore.getState();

  if (!token) {
    throw redirect({
      to: '/',
      search: { redirect: location.href },
    });
  }
};
