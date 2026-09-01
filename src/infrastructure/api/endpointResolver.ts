import { EndpointConfig, ProviderType } from "@/infrastructure/types/api/endpointConfig.types";
import { ProviderRegistry } from "./providerRegistry";
import { ValidationError } from "./errors";

export interface EndpointResolverConfig {
  providerPriority?: ProviderType[];
  masterOverride?: ProviderType;
}

export class EndpointResolver<TRoutes extends Record<string, EndpointConfig>> {
  private config: EndpointResolverConfig;

  constructor(
    private routes: TRoutes,
    private registry: ProviderRegistry,
    config: EndpointResolverConfig = {}
  ) {
    this.config = {
      providerPriority: config.providerPriority ?? ["trpc", "rest", "mock"],
      ...config,
    };
  }

  async execute<TRouteName extends keyof TRoutes>(
    routeName: TRouteName,
    args: unknown
  ): Promise<unknown> {
    const route = this.routes[routeName];

    if (!route) {
      throw new Error(`Route '${String(routeName)}' not found`);
    }

    const providerType = this.resolveProvider(routeName, route);
    const provider = this.registry.get(providerType);

    // Get the appropriate config based on provider type
    const providerConfig = this.getProviderConfig(route, providerType);

    // Execute the provider with mapper option if REST provider and mapper is configured
    let rawResponse: unknown;
    if (providerType === 'rest' && route.rest?.mapper) {
      rawResponse = await provider.execute(providerConfig, args, { mapper: route.rest.mapper });
    } else {
      rawResponse = await provider.execute(providerConfig, args);
    }

    // Boundary validation: if schema is present, validate the response
    if (route.schema) {
      const result = route.schema.safeParse(rawResponse);
      if (!result.success) {
        throw new ValidationError('Response validation failed', result.error);
      }
      return result.data;
    }

    return rawResponse;
  }

  private resolveProvider(
    routeName: keyof TRoutes,
    route: EndpointConfig
  ): ProviderType {
    // MASTER OVERRIDE - Highest priority (forces everything)
    if (this.config.masterOverride) {
      return this.config.masterOverride;
    }

    // EXPLICIT PROVIDER - Route explicitly says which to use
    if (route.provider) {
      return route.provider;
    }

    // AUTO-DETECT based on priority
    const priority = this.config.providerPriority ?? ["trpc", "rest", "mock"];

    for (const providerType of priority) {
      if (this.isProviderAvailable(route, providerType)) {
        return providerType;
      }
    }

    // No provider found - error
    const available = this.getAvailableProviders(route);
    throw new Error(
      `No provider found for route '${String(routeName)}'. ` +
        `Available configurations: ${available.length > 0 ? available.join(", ") : "none"}. ` +
        `Please ensure the route has at least one provider configuration (rest, trpc, graphql, or mock).`
    );
  }

  private getProviderConfig(
    route: EndpointConfig,
    providerType: ProviderType
  ): unknown {
    switch (providerType) {
      case "rest":
        return route.rest;
      case "trpc":
        return route.trpc;
      case "graphql":
        return route.graphql;
      case "mock":
        return route.mock;
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  private isProviderAvailable(
    route: EndpointConfig,
    providerType: ProviderType
  ): boolean {
    switch (providerType) {
      case "rest":
        return !!route.rest;
      case "trpc":
        return !!route.trpc && this.registry.has("trpc");
      case "graphql":
        return !!route.graphql && this.registry.has("graphql");
      case "mock":
        return !!route.mock;
      default:
        return false;
    }
  }

  private getAvailableProviders(route: EndpointConfig): ProviderType[] {
    const available: ProviderType[] = [];
    if (route.rest) available.push("rest");
    if (route.trpc && this.registry.has("trpc")) available.push("trpc");
    if (route.graphql && this.registry.has("graphql")) available.push("graphql");
    if (route.mock) available.push("mock");
    return available;
  }

  getRouteProviders(): Record<keyof TRoutes, ProviderType | "error"> {
    const result: Record<string, ProviderType | "error"> = {};

    for (const routeName of Object.keys(this.routes)) {
      const route = this.routes[routeName];
      try {
        result[routeName] = this.resolveProvider(routeName, route);
      } catch {
        result[routeName] = "error";
      }
    }

    return result as Record<keyof TRoutes, ProviderType | "error">;
  }
}
