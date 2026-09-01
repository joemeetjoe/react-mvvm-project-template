// src/utils/filterConfigBuilder.ts
import type { TBaseFormFiltersConfig } from "@/infrastructure/types/ui/filters.types";

/**
 * Generic filter ui builder - merges base structure with dynamic options
 * @param baseConfig - The base filter configuration structure (without options)
 * @param filterOptions - Dynamic options from backend (record of fieldName -> options[])
 * @returns Complete TBaseFormFiltersConfig with options populated
 */
export function buildFilterConfig(
    baseConfig: TBaseFormFiltersConfig,
    filterOptions: Record<string, unknown> | undefined
): TBaseFormFiltersConfig {
    if (!filterOptions) return baseConfig;

    return {
        textFilters: baseConfig.textFilters || [],
        selectFilters: (baseConfig.selectFilters || []).map((filter: any) => ({
            ...filter,
            options: (filterOptions as any)[filter.id] || []
        })),
        dateFilters: baseConfig.dateFilters || [],
        numberFilters: baseConfig.numberFilters || [],
    };
}
