// src/features/tasking/api/mocks/mockUtils.ts
import type { TBaseFilterOptionConfig } from '@/infrastructure/types/ui/filters.types';

/**
 * Paginated response type
 */
export interface PaginatedResponse<TData = any> {
    data: TData[];
    pagination: {
        pageIndex: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Extract unique values from a specific field and format as filter options
 */
export function extractUniqueOptions<T extends Record<string, any>>(
    data: T[],
    field: keyof T,
    labelPrefix?: string
): TBaseFilterOptionConfig[] {
    const uniqueValues = Array.from(
        new Set(data.map(item => item[field] as string))
    ).sort();

    const fieldName = labelPrefix || String(field).charAt(0).toUpperCase() + String(field).slice(1);

    return [
        { value: 'all', label: `All ${fieldName}s` },
        ...uniqueValues.map(value => ({
            value: String(value),
            label: String(value)
        }))
    ];
}

/**
 * Apply filters to api
 */
export function applyFilters<T extends Record<string, any>>(
    data: T[],
    filters: Record<string, string>
): T[] {
    if (!filters || Object.keys(filters).length === 0) {
        return data;
    }

    return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value === 'all') return true;
            const itemValue = String(item[key]).toLowerCase();
            return itemValue.includes(value.toLowerCase());
        });
    });
}

/**
 * Apply sorting to api
 */
export function applySorting<T extends Record<string, any>>(
    data: T[],
    sortConfig: { field: string; direction: 'asc' | 'desc' } | null
): T[] {
    if (!sortConfig) {
        return data;
    }

    const sorted = [...data];

    sorted.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Compare values
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}

/**
 * Apply pagination to api
 */
export function applyPagination<T>(
    data: T[],
    pageIndex: number,
    pageSize: number
): PaginatedResponse<T> {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const paginatedData = data.slice(start, end);

    return {
        data: paginatedData,
        pagination: {
            pageIndex,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: pageIndex < totalPages - 1,
            hasPreviousPage: pageIndex > 0,
        },
    };
}

/**
 * Process mock api with filters, sorting, and pagination
 * (One-stop function for common mock api operations)
 */
export function processMockData<T extends Record<string, any>>(
    data: T[],
    options: {
        filters?: Record<string, string>;
        sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
        page?: number;
        limit?: number;
    }
): PaginatedResponse<T> {
    const { filters = {}, sortConfig = null, page = 0, limit = 10 } = options;

    let processedData = [...data];

    // Apply filters
    processedData = applyFilters(processedData, filters);

    // Apply sorting
    processedData = applySorting(processedData, sortConfig);

    // Apply pagination
    return applyPagination(processedData, page, limit);
}
