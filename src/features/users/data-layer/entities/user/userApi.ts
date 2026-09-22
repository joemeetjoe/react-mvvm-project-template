import { httpGet, httpPatch } from '@/shared/lib/http';
import { parseResponse } from '@/shared/lib/parseResponse';

import {
  type SortDirection,
  type User,
  type UserFilterOptions,
  type UserListResponse,
  type UserRole,
  type UserSortField,
  type UserStatus,
  type UserUpdate,
  userFilterOptionsSchema,
  userListResponseSchema,
  userSchema,
} from './userSchema';

export const userEndpoints = {
  list: '/api/users',
  detail: (id: string): string => `/api/users/${id}`,
  filterOptions: '/api/users/filter-options',
} as const;

export type UserListParams = {
  sort: UserSortField;
  direction: SortDirection;
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  department?: string;
};

export const fetchUserList = async (params: UserListParams): Promise<UserListResponse> => {
  const query = new URLSearchParams({
    sort: params.sort,
    direction: params.direction,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.department) query.set('department', params.department);

  const payload = await httpGet(`${userEndpoints.list}?${query.toString()}`);

  return parseResponse(userListResponseSchema, 'user list', payload);
};

export const fetchUserFilterOptions = async (): Promise<UserFilterOptions> => {
  const payload = await httpGet(userEndpoints.filterOptions);

  return parseResponse(userFilterOptionsSchema, 'user filter options', payload);
};

export const fetchUserDetail = async (id: string): Promise<User> => {
  const payload = await httpGet(userEndpoints.detail(id));

  return parseResponse(userSchema, 'user detail', payload);
};

export const updateUser = async (id: string, update: UserUpdate): Promise<User> => {
  const payload = await httpPatch(userEndpoints.detail(id), update);

  return parseResponse(userSchema, 'user detail', payload);
};
