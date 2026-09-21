import { httpGet } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import {
  type SortDirection,
  type User,
  type UserListResponse,
  type UserSortField,
  userListResponseSchema,
  userSchema,
} from './userSchema';

export const userEndpoints = {
  list: '/api/users',
  detail: (id: string): string => `/api/users/${id}`,
} as const;

export type UserListParams = {
  sort: UserSortField;
  direction: SortDirection;
  page: number;
  pageSize: number;
};

export const fetchUserList = async (params: UserListParams): Promise<UserListResponse> => {
  const query = new URLSearchParams({
    sort: params.sort,
    direction: params.direction,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const payload = await httpGet(`${userEndpoints.list}?${query.toString()}`);

  return parseResponse(userListResponseSchema, 'user list', payload);
};

export const fetchUserDetail = async (id: string): Promise<User> => {
  const payload = await httpGet(userEndpoints.detail(id));

  return parseResponse(userSchema, 'user detail', payload);
};
