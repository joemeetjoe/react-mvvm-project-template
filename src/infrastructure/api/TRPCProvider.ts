import { TRPCEndpointConfig } from "@/infrastructure/types/api/endpointConfig.types";
import { IProvider } from "./providerRegistry";
import { ProviderError } from "./errors";
import { TRPCClientError } from "@trpc/client";

interface TRPCClient {
  [key: string]: TRPCClient | {
    query: <T>(args: unknown) => Promise<T>;
    mutate: <T>(args: unknown) => Promise<T>;
  };
}

export class TRPCProvider implements IProvider {
  constructor(private trpc: TRPCClient) {}

  async execute<TResult>(config: unknown, args: unknown): Promise<TResult> {
    try {
      const endpoint = config as TRPCEndpointConfig;

      if (!endpoint) {
        throw new Error("tRPC endpoint configuration not found");
      }

      const { path, type } = endpoint;
      const procedure = this.resolvePath(this.trpc, path);

      if (type === "query") {
        return await (procedure.query(args) as Promise<TResult>);
      } else if (type === "mutation") {
        return await (procedure.mutate(args) as Promise<TResult>);
      } else {
        throw new Error(`Unsupported tRPC type: ${type}`);
      }
    } catch (error) {
      // Map TRPCClientError to ProviderError
      if (error instanceof TRPCClientError) {
        throw new ProviderError(
          error.message,
          `TRPC_${error.data?.code || 'UNKNOWN'}`,
          error.data?.httpStatus,
          error.data
        );
      }

      // Map generic Error to ProviderError
      if (error instanceof Error) {
        throw new ProviderError(
          error.message,
          'TRPC_UNKNOWN',
          undefined,
          undefined
        );
      }

      // Handle unknown errors
      throw new ProviderError(
        'An unknown tRPC error occurred',
        'TRPC_UNKNOWN',
        undefined,
        undefined
      );
    }
  }

  private resolvePath(obj: TRPCClient, path: string): any {
    const result = path.split(".").reduce((current, key) => {
      const next = current[key];
      if (!next) {
        throw new Error(`Invalid tRPC path: ${path}`);
      }
      return next as TRPCClient;
    }, obj);

    return result;
  }
}
