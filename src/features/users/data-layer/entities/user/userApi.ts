import { httpGet, httpPatch } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import { type User, type UserUpdate, userListSchema, userSchema } from './userSchema';

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

export const updateUser = async (id: string, update: UserUpdate): Promise<User> => {
  const payload = await httpPatch(userEndpoints.detail(id), update);

  return parseResponse(userSchema, 'user detail', payload);
};
