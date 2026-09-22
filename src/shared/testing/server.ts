import { setupServer } from 'msw/node';

import { sessionHandlers } from '@/features/auth/data-layer/entities/session/sessionHandlers';
import { userHandlers } from '@/features/users/data-layer/entities/user/userHandlers';
// plop:handler-import

export const handlers = [...userHandlers, ...sessionHandlers];

export const server = setupServer(...handlers);
