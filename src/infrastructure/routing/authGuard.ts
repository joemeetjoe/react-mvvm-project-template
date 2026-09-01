import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/infrastructure/stores/useAuthStore';

export const authGuard = (): Record<string, never> => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (!isAuthenticated) {
    throw redirect({
      to: '/',
    });
  }

  return {};
};
