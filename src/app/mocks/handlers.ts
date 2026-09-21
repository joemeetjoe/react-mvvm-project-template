import { sessionHandlers } from '@/features/auth/data-layer/entities/session/sessionHandlers';
import { userHandlers } from '@/features/users/data-layer/entities/user/userHandlers';

/**
 * Aggregates every feature entity's MSW handlers for the dev-mode browser
 * worker. Mirrors `shared/testing/server`'s aggregation for the Node test
 * server — same handlers, two different MSW transports.
 */
export const handlers = [...userHandlers, ...sessionHandlers];
