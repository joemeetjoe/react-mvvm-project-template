import { httpGet } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import { type User, userListSchema } from './userSchema';

export const userEndpoints = {
  list: '/api/users',
} as const;

export const fetchUserList = async (): Promise<User[]> => {
  const payload = await httpGet(userEndpoints.list);

  return parseResponse(userListSchema, 'user list', payload);
};
