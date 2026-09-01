import { MockEndpointConfig } from "@/infrastructure/types/api/endpointConfig.types";
import { IProvider } from "./providerRegistry";
import { ProviderError } from "./errors";
import type { ZodSchema } from "zod";

export class MockProvider implements IProvider {
  constructor(private defaultDelay: number = 500) {}

  async execute<TResult>(
    config: unknown,
    args: unknown,
    options?: { schema?: ZodSchema }
  ): Promise<TResult> {
    try {
      const endpoint = config as MockEndpointConfig<typeof args, TResult>;

      if (!endpoint) {
        throw new Error("Mock endpoint configuration not found");
      }

      // Validate handler exists
      if (!endpoint.handler) {
        throw new ProviderError(
          'No mock handler configured',
          'MOCK_NOT_CONFIGURED'
        );
      }

      const delay = endpoint.delay ?? this.defaultDelay;
      await this.wait(delay);

      const result = await endpoint.handler(args);

      // Check for missing data (null/undefined for query operations)
      if (result === undefined || result === null) {
        throw new ProviderError(
          'Mock handler returned no data',
          'MOCK_NOT_FOUND',
          404
        );
      }

      // Optional schema validation
      if (options?.schema) {
        const parseResult = options.schema.safeParse(result);
        if (!parseResult.success) {
          throw new ProviderError(
            `Mock data does not match expected schema: ${parseResult.error.message}`,
            'MOCK_SCHEMA_MISMATCH',
            500
          );
        }
        return parseResult.data as TResult;
      }

      return result;
    } catch (error) {
      // Re-throw ProviderError as-is
      if (error instanceof ProviderError) {
        throw error;
      }

      // Wrap other errors in ProviderError
      if (error instanceof Error) {
        throw new ProviderError(
          error.message,
          'MOCK_ERROR',
          undefined,
          undefined
        );
      }

      // Handle unknown errors
      throw new ProviderError(
        'Mock handler failed',
        'MOCK_ERROR',
        undefined,
        undefined
      );
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
