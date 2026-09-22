import { httpPost } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import { type LoginCredentials, type Session, sessionSchema } from './sessionSchema';

export const sessionEndpoints = {
  login: '/api/login',
} as const;

export const login = async (credentials: LoginCredentials): Promise<Session> => {
  const payload = await httpPost(sessionEndpoints.login, credentials);

  return parseResponse(sessionSchema, 'login', payload);
};
