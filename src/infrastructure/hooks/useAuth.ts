import { useAuthStore } from '@/infrastructure/stores/useAuthStore';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, error, login, logout, clearError } =
    useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
