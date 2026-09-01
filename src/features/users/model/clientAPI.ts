import {
  BaseClientAPI,
  type BaseClientAPIConfig,
  type BaseClientAPIDependencies,
} from '@/infrastructure/api/baseClientAPI';
import { ProviderRegistry } from '@/infrastructure/api/providerRegistry';
import { RESTProvider } from '@/infrastructure/api/RESTProvider';
import { TRPCProvider } from '@/infrastructure/api/TRPCProvider';
import { MockProvider } from '@/infrastructure/api/MockProvider';
import { GraphQLProvider } from '@/infrastructure/api/GraphQLProvider';
import { EndpointResolver, type EndpointResolverConfig } from '@/infrastructure/api/endpointResolver';
import { trpcClient, isTRPCConfigured } from '@/infrastructure/api/trpc';
import { usersRoutes, type UsersRoutes } from './endpointConfig';
import type {
  GetUsersListParams,
  GetUsersListResponse,
  GetUserDetailParams,
  GetUserDetailResponse,
  GetUserFiltersParams,
  GetUserFiltersResponse,
  User,
} from './types';

export interface UsersClientAPIConfig extends BaseClientAPIConfig {
  mockDelay?: number;
  resolverConfig?: EndpointResolverConfig;
  graphqlUrl?: string;
}

export class UsersClientAPI extends BaseClientAPI {
  private resolver: EndpointResolver<UsersRoutes>;
  private registry: ProviderRegistry;

  constructor(
    config: UsersClientAPIConfig,
    dependencies: BaseClientAPIDependencies = {}
  ) {
    super(config, dependencies);

    this.registry = new ProviderRegistry();

    // Register providers
    this.registry.register('rest', new RESTProvider(this));
    this.registry.register('mock', new MockProvider(config.mockDelay));

    // Register tRPC if configured
    if (dependencies.trpcClient || isTRPCConfigured()) {
      this.registry.register('trpc', new TRPCProvider(dependencies.trpcClient || trpcClient));
    }

    // Register GraphQL if configured
    const graphqlUrl = config.graphqlUrl || import.meta.env.VITE_GRAPHQL_URL;
    if (graphqlUrl) {
      this.registry.register('graphql', new GraphQLProvider(graphqlUrl));
    }

    this.resolver = new EndpointResolver(
      usersRoutes,
      this.registry,
      config.resolverConfig
    );
  }

  // Explicit typed methods
  async getUsersList(params: GetUsersListParams): Promise<GetUsersListResponse> {
    return this.resolver.execute('getUsersList', params) as Promise<GetUsersListResponse>;
  }

  async getUserDetail(userId: string): Promise<GetUserDetailResponse> {
    return this.resolver.execute('getUserDetail', { userId }) as Promise<GetUserDetailResponse>;
  }

  async getUserFilters(params?: GetUserFiltersParams): Promise<GetUserFiltersResponse> {
    return this.resolver.execute('getUserFilters', params) as Promise<GetUserFiltersResponse>;
  }

  // VM-compatible adapter methods (matching TBaseDetailService interface)
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.resolver.execute('updateUser', { userId, data }) as Promise<User>;
  }

  async deleteUser(userId: string): Promise<void> {
    return this.resolver.execute('deleteUser', { userId }) as Promise<void>;
  }

  // Utility methods
  getActiveProviders(): Record<keyof UsersRoutes, string> {
    return this.resolver.getRouteProviders() as Record<keyof UsersRoutes, string>;
  }
}

// Create and export singleton instance
export const usersService = new UsersClientAPI(
  {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    mockDelay: 300,
    resolverConfig: {
      providerPriority: ['trpc', 'rest', 'graphql', 'mock'],
      masterOverride: import.meta.env.MODE === 'development' ? 'mock' : undefined,
    },
  },
  {}
);
