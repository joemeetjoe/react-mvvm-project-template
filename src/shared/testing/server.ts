import { setupServer } from 'msw/node';

import { userHandlers } from '@/features/users/data-layer/entities/user/userHandlers';

/**
 * The MSW server for tests. Handlers stay colocated with the entity that owns
 * them; this module only aggregates them. Per-test overrides go through
 * `server.use(...)`.
 */
export const handlers = [...userHandlers];

export const server = setupServer(...handlers);
