import { BaseClientAPI, BaseClientAPIError } from "./baseClientAPI";
import { RESTEndpointConfig } from "@/infrastructure/types/api/endpointConfig.types";
import { IProvider } from "./providerRegistry";
import { ProviderError } from "./errors";

export class RESTProvider implements IProvider {
  constructor(private api: BaseClientAPI) {}

  async execute<TResult>(
    config: unknown,
    args: unknown,
    options?: { mapper?: (raw: unknown) => TResult }
  ): Promise<TResult> {
    try {
      const endpoint = config as RESTEndpointConfig<typeof args>;

      if (!endpoint) {
        throw new Error("REST endpoint configuration not found");
      }

      const { method, path, body } = endpoint;
      const params = args as Record<string, any> | undefined;
      const url = typeof path === "function" ? path(params) : path;

      let rawResponse: unknown;

      switch (method) {
        case "GET":
          rawResponse = await this.api["get"](url, { params });
          break;
        case "POST":
          rawResponse = await this.api["post"](url, body ? params : undefined, {
            params: body ? undefined : params,
          });
          break;
        case "PUT":
          rawResponse = await this.api["put"](url, body ? params : undefined, {
            params: body ? undefined : params,
          });
          break;
        case "PATCH":
          rawResponse = await this.api["patch"](url, body ? params : undefined, {
            params: body ? undefined : params,
          });
          break;
        case "DELETE":
          rawResponse = await this.api["delete"](url, { params });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Apply optional response transformation
      if (options?.mapper) {
        return options.mapper(rawResponse);
      }

      return rawResponse as TResult;
    } catch (error) {
      // Map BaseClientAPIError to ProviderError
      if (error instanceof BaseClientAPIError) {
        throw new ProviderError(
          error.message,
          `REST_${error.status || 'UNKNOWN'}`,
          error.status,
          error.data
        );
      }

      // Map generic Error to ProviderError
      if (error instanceof Error) {
        throw new ProviderError(
          error.message,
          'REST_UNKNOWN',
          undefined,
          undefined
        );
      }

      // Handle unknown errors
      throw new ProviderError(
        'An unknown error occurred',
        'REST_UNKNOWN',
        undefined,
        undefined
      );
    }
  }
}
