import { httpGet } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import { type SortDirection, type UserListResponse, type UserSortField, userListResponseSchema } from './userSchema';

export const userEndpoints = {
  list: '/api/users',
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
