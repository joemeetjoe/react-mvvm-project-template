import type { ZodSchema } from 'zod';

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type TRPCType = "query" | "mutation";
export type ProviderType = "rest" | "trpc" | "mock" | "graphql";

export interface RESTEndpointConfig<TArgs = unknown> {
  method: HTTPMethod;
  path: string | ((args: TArgs) => string);
  body?: boolean;
  mapper?: (raw: unknown) => unknown;
}

export interface TRPCEndpointConfig {
  path: string;
  type: TRPCType;
}

export interface MockEndpointConfig<TArgs = unknown, TResult = unknown> {
  handler: (args: TArgs) => TResult | Promise<TResult>;
  delay?: number;
}

export interface GraphQLEndpointConfig {
  query: string;
  variables?: Record<string, unknown> | ((args: unknown) => Record<string, unknown>);
  type: 'query' | 'mutation';
  extractPath?: string;
}

export interface EndpointConfig<TArgs = any, TResult = any> {
  rest?: RESTEndpointConfig<TArgs>;
  trpc?: TRPCEndpointConfig;
  mock?: MockEndpointConfig<TArgs, TResult>;
  graphql?: GraphQLEndpointConfig;
  provider?: ProviderType;
  schema?: ZodSchema;
}

// Helper to extract input/output types from endpoint config
export type EndpointInput<T> = T extends EndpointConfig<infer TArgs, unknown> ? TArgs : never;
export type EndpointOutput<T> = T extends EndpointConfig<unknown, infer TResult> ? TResult : never;
