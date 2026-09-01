// src/api/base/baseClientAPI.ts
import { QueryClient } from "@tanstack/react-query";
import type { Router } from "@tanstack/react-router";

export interface BaseClientAPIConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface BaseClientAPIDependencies {
  queryClient?: QueryClient;
  router?: Router<any>;
  trpcClient?: any;
  authToken?: () => string | null;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

export class BaseClientAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message);
    this.name = "BaseClientAPIError";
  }
}

export abstract class BaseClientAPI {
  protected config: BaseClientAPIConfig;
  protected dependencies: BaseClientAPIDependencies;

  constructor(
    config: BaseClientAPIConfig,
    dependencies: BaseClientAPIDependencies = {},
  ) {
    this.config = {
      timeout: 30000,
      ...config,
    };
    this.dependencies = dependencies;
  }

  // Getters for dependencies
  protected get queryClient(): QueryClient | undefined {
    return this.dependencies.queryClient;
  }

  protected get router(): Router<any> | undefined {
    return this.dependencies.router;
  }

  protected get trpcClient(): any {
    return this.dependencies.trpcClient;
  }

  protected get authToken(): string | null {
    return this.dependencies.authToken?.() ?? null;
  }

  // Build query string from params
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params) return "";

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  // Build full URL
  protected buildURL(endpoint: string, params?: Record<string, any>): string {
    const queryString = this.buildQueryString(params);
    return `${this.config.baseURL}${endpoint}${queryString}`;
  }

  // Get default headers
  protected getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };

    const token = this.authToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Core fetch wrapper with error handling
  protected async fetch<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const { params, timeout = this.config.timeout, ...fetchConfig } = config;

    const url = this.buildURL(endpoint, params);
    const headers = {
      ...this.getDefaultHeaders(),
      ...fetchConfig.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.tryParseJSON(response);
        throw new BaseClientAPIError(
          errorData?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof BaseClientAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new BaseClientAPIError("Request timeout");
        }
        throw new BaseClientAPIError(error.message);
      }

      throw new BaseClientAPIError("An unknown error occurred");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // HTTP method helpers
  protected async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.fetch<T>(endpoint, { ...config, method: "GET" });
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<T> {
    return this.fetch<T>(endpoint, { ...config, method: "DELETE" });
  }

  private async tryParseJSON(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  // Invalidate queries
  protected invalidateQueries(queryKey: string[]): void {
    this.queryClient?.invalidateQueries({ queryKey });
  }

  // Navigate
  protected navigate(to: string, options?: any): void {
    this.router?.navigate({ to, ...options });
  }
}
