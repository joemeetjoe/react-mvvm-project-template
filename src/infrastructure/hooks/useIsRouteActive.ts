import { useRouterState } from '@tanstack/react-router';

export function useIsRouteActive() {
  const location = useRouterState({ select: (s) => s.location });

  const isRouteActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  return { isRouteActive };
}
