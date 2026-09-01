import { ProviderType } from "@/infrastructure/types/api/endpointConfig.types";

export interface IProvider {
  execute<TResult>(config: unknown, args: unknown, options?: Record<string, unknown>): Promise<TResult>;
}

export interface ProviderConfig<TRoutes extends Record<string, unknown>> {
  default: ProviderType;
  overrides?: Partial<Record<keyof TRoutes, ProviderType>>;
}

export class ProviderRegistry {
  private providers = new Map<ProviderType, IProvider>();

  register(type: ProviderType, provider: IProvider): this {
    this.providers.set(type, provider);
    return this;
  }

  get(type: ProviderType): IProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider '${type}' not found in registry`);
    }
    return provider;
  }

  has(type: ProviderType): boolean {
    return this.providers.has(type);
  }
}
