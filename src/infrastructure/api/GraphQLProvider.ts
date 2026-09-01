import { GraphQLClient, ClientError } from 'graphql-request';
import type { ProviderError as ProviderErrorType } from './errors';
import { ProviderError } from './errors';

export interface GraphQLEndpointConfig {
  query: string;
  variables?: Record<string, unknown> | ((args: unknown) => Record<string, unknown>);
  type: 'query' | 'mutation';
  extractPath?: string;
}

export class GraphQLProvider {
  private client: GraphQLClient;

  constructor(endpoint: string, headers?: Record<string, string>) {
    this.client = new GraphQLClient(endpoint, { headers });
  }

  updateHeaders(headers: Record<string, string>): void {
    this.client = new GraphQLClient((this.client as any).url, { headers });
  }

  async execute<TResult = unknown>(config: unknown, args: unknown): Promise<TResult> {
    try {
      const endpoint = config as GraphQLEndpointConfig;
      if (!endpoint) throw new Error('GraphQL endpoint configuration not found');

      const variables = typeof endpoint.variables === 'function'
        ? endpoint.variables(args)
        : { ...(endpoint.variables || {}), ...(args as Record<string, unknown> || {}) };

      const result = await this.client.request<Record<string, unknown>>(
        endpoint.query,
        variables
      );

      if (endpoint.extractPath) {
        const extracted = endpoint.extractPath.split('.').reduce(
          (obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key],
          result as unknown
        );
        return extracted as TResult;
      }

      return result as TResult;
    } catch (error) {
      if (error instanceof ClientError) {
        throw new ProviderError(
          error.message,
          `GRAPHQL_${error.response?.status || 'UNKNOWN'}`,
          error.response?.status,
          error.response?.errors
        );
      }
      if (error instanceof Error) {
        throw new ProviderError(error.message, 'GRAPHQL_UNKNOWN');
      }
      throw new ProviderError('An unknown GraphQL error occurred', 'GRAPHQL_UNKNOWN');
    }
  }
}
