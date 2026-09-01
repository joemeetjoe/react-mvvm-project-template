import type { EndpointConfig, TRPCType, HTTPMethod } from '@/infrastructure/types/api/endpointConfig.types';
import type {
  GetUsersListParams,
  GetUsersListResponse,
  GetUserDetailParams,
  GetUserDetailResponse,
  GetUserFiltersParams,
  GetUserFiltersResponse,
  UpdateUserParams,
  UpdateUserResponse,
  DeleteUserParams,
  DeleteUserResponse,
} from './types';
import { mockUsers } from './mocks/users';
import { mockFilterOptions } from './mocks/filterOptions';
import { processMockData } from '@/infrastructure/utils/mockUtils';
import { UsersListResponseSchema, userSchema, UserFilterOptionsSchema } from './schemas';

export const usersRoutes = {
  getUsersList: {
    rest: {
      method: 'GET' as HTTPMethod,
      path: '/api/v1/users',
    },
    trpc: {
      path: 'users.getList',
      type: 'query' as TRPCType,
    },
    graphql: {
      query: `query GetUsers($filters: JSON, $page: Int, $limit: Int) {
        users(filters: $filters, page: $page, limit: $limit) {
          data { id firstName lastName email role status department createdAt updatedAt avatar }
          total page limit
        }
      }`,
      type: 'query' as const,
      extractPath: 'users',
    },
    mock: {
      handler: (params: GetUsersListParams): GetUsersListResponse => {
        const { filters = {}, sortConfig = null, page = 0, limit = 10 } = params;
        return processMockData(mockUsers, { filters: filters as Record<string, string>, sortConfig, page, limit });
      },
    },
    schema: UsersListResponseSchema,
  } satisfies EndpointConfig<GetUsersListParams, GetUsersListResponse>,

  getUserDetail: {
    rest: {
      method: 'GET' as HTTPMethod,
      path: (args: GetUserDetailParams) => `/api/v1/users/${args.userId}`,
    },
    trpc: {
      path: 'users.getDetail',
      type: 'query' as TRPCType,
    },
    graphql: {
      query: `query GetUser($userId: ID!) {
        user(id: $userId) { id firstName lastName email role status department createdAt updatedAt avatar }
      }`,
      type: 'query' as const,
      extractPath: 'user',
    },
    mock: {
      handler: (args: GetUserDetailParams): GetUserDetailResponse => {
        const user = mockUsers.find((u) => u.id === args.userId);
        if (!user) throw new Error(`User with ID ${args.userId} not found`);
        return user;
      },
    },
    schema: userSchema,
  } satisfies EndpointConfig<GetUserDetailParams, GetUserDetailResponse>,

  getUserFilters: {
    rest: {
      method: 'GET' as HTTPMethod,
      path: '/api/v1/users/filters',
    },
    trpc: {
      path: 'users.getFilters',
      type: 'query' as TRPCType,
    },
    graphql: {
      query: `query GetUserFilters { userFilters { role { value label } status { value label } department { value label } } }`,
      type: 'query' as const,
      extractPath: 'userFilters',
    },
    mock: {
      handler: (_args: GetUserFiltersParams): GetUserFiltersResponse => mockFilterOptions,
    },
    schema: UserFilterOptionsSchema,
  } satisfies EndpointConfig<GetUserFiltersParams, GetUserFiltersResponse>,

  updateUser: {
    rest: {
      method: 'PATCH' as HTTPMethod,
      path: (args: UpdateUserParams) => `/api/v1/users/${args.userId}`,
      body: true,
    },
    trpc: {
      path: 'users.update',
      type: 'mutation' as TRPCType,
    },
    graphql: {
      query: `mutation UpdateUser($userId: ID!, $data: UserInput!) {
        updateUser(id: $userId, data: $data) { id firstName lastName email role status department createdAt updatedAt avatar }
      }`,
      type: 'mutation' as const,
      extractPath: 'updateUser',
    },
    mock: {
      handler: (args: UpdateUserParams): UpdateUserResponse => {
        const user = mockUsers.find((u) => u.id === args.userId);
        if (!user) throw new Error(`User with ID ${args.userId} not found`);
        return { ...user, ...args.data, updatedAt: new Date().toISOString() };
      },
    },
    schema: userSchema,
  } satisfies EndpointConfig<UpdateUserParams, UpdateUserResponse>,

  deleteUser: {
    rest: {
      method: 'DELETE' as HTTPMethod,
      path: (args: DeleteUserParams) => `/api/v1/users/${args.userId}`,
    },
    trpc: {
      path: 'users.delete',
      type: 'mutation' as TRPCType,
    },
    graphql: {
      query: `mutation DeleteUser($userId: ID!) { deleteUser(id: $userId) }`,
      type: 'mutation' as const,
      extractPath: 'deleteUser',
    },
    mock: {
      handler: (args: DeleteUserParams): DeleteUserResponse => {
        console.log(`[Mock] User ${args.userId} deleted`);
      },
    },
  } satisfies EndpointConfig<DeleteUserParams, DeleteUserResponse>,
} as const;

export type UsersRoutes = typeof usersRoutes;
export type UsersEndpoint = keyof UsersRoutes;
