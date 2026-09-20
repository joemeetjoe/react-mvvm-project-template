import { QueryClient } from '@tanstack/react-query';

/**
 * The single TanStack Query client for the app, provided to both the
 * `QueryClientProvider` and the router context.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});
