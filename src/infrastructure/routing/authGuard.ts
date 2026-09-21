import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/infrastructure/stores/useAuthStore';

export const authGuard = (): void => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (!isAuthenticated) {
    throw redirect({
      to: '/',
    });
  }
};
