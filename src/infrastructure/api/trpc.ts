import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';

// TODO: Import from backend when tRPC router is implemented. See RESEARCH.md Open Question #1.
// Future import: import type { AppRouter } from '@/server/routers/_app';
type AppRouter = any;

/**
 * tRPC React client for TanStack Query integration
 * Used for React components with hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * tRPC vanilla client for provider-level usage
 * Configured with httpBatchLink and auth header injection
 */
export const trpcClient = (trpc as any).createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL || 'http://localhost:3000/trpc',
      headers() {
        // Auth token injection - reads from localStorage
        // This pattern allows the header to update on each request
        const token = localStorage.getItem('authToken');
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

/**
 * Helper to check if tRPC is configured via environment variable
 * @returns true if VITE_TRPC_URL is set, false otherwise
 */
export function isTRPCConfigured(): boolean {
  return !!import.meta.env.VITE_TRPC_URL;
}
