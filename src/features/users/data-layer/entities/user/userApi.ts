import { httpGet } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import { type User, userListSchema, userSchema } from './userSchema';

export const userEndpoints = {
  list: '/api/users',
  detail: (id: string): string => `/api/users/${id}`,
} as const;

export const fetchUserList = async (): Promise<User[]> => {
  const payload = await httpGet(userEndpoints.list);

  return parseResponse(userListSchema, 'user list', payload);
};

export const fetchUserDetail = async (id: string): Promise<User> => {
  const payload = await httpGet(userEndpoints.detail(id));

  return parseResponse(userSchema, 'user detail', payload);
};
