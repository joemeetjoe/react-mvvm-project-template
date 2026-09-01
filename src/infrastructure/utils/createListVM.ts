
// src/core/vm/createListVM.ts
/**
 * Creates a fully-featured list view model with filtering, sorting, pagination, and selection.
 *
 * @template TData - List item data type
 * @template TStore - Zustand store hook type
 * @template TService - Service with getList/getFilters methods
 *
 * @see {@link file://./docs/architecture/list-vm-factory.md} - Detailed documentation
 * @see {@link file://./docs/guides/extending-list-vms.md} - Extension guide
 */

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { buildFilterConfig } from '@/infrastructure/utils/filterConfigBuilder';
import type {
    TBaseListStoreHook,
    TBaseListService,
    TSortingState,
    TBaseListViewModel,
    TBaseColumnConfig,
    TBaseFormFiltersConfig,
    TBaseListCardConfig,
    TBaseAsyncWrapperConfig,
    TBaseFormApi
} from '@/infrastructure/types/vm/list.types';

// ========================================
// GENERIC FACTORY CONFIGURATION TYPE
// ========================================
export type TListVMFactoryConfig<
    TData,
    TStore extends TBaseListStoreHook,
    TService extends TBaseListService<TData>
> = {
    store: TStore;
    service: TService;
    queryKey: string;
    columnConfig: TBaseColumnConfig;
    filterConfig: TBaseFormFiltersConfig;
    cardConfig: TBaseListCardConfig;
    asyncConfig?: TBaseAsyncWrapperConfig;
    serviceMethods?: {
        getList?: string;
        getFilters?: string;
    };
};

// ========================================
// 1. STORE STATE
// ========================================
function useStoreState<TStore extends TBaseListStoreHook>(store: TStore) {
    const filters = store(state => state.filters);
    const sortingState = store(state => state.sortingState);
    const pagination = store(state => state.pagination);
    const rowSelection = store(state => state.rowSelection);

    return { filters, sortingState, pagination, rowSelection };
}

// ========================================
// 2. STORE ACTIONS
// ========================================
function useStoreActions<TStore extends TBaseListStoreHook>(store: TStore) {
    const setFilters = store(state => state.setFilters);
    const clearFilters = store(state => state.clearFilters);
    const toggleRow = store(state => state.toggleRow);
    const setSortingState = store(state => state.setSortingState);
    const setPageIndex = store(state => state.setPageIndex);
    const setPageSize = store(state => state.setPageSize);
    const reset = store(state => state.reset);
    const nextPage = store(state => state.nextPage);
    const previousPage = store(state => state.previousPage);
    const clearSelection = store(state => state.clearSelection);
    const selectAll = store(state => state.selectAll);

    return {
        setFilters,
        clearFilters,
        toggleRow,
        setSortingState,
        setPageIndex,
        setPageSize,
        reset,
        nextPage,
        previousPage,
        clearSelection,
        selectAll,
    };
}

// ========================================
// 3. SERVER QUERIES
// ========================================
function useServerQueries<TData, TService extends TBaseListService<TData>>(
    service: TService,
    queryKey: string,
    filters: Record<string, string>,
    sortingState: TSortingState | null,
    pageIndex: number,
    pageSize: number,
    serviceMethods: { getList: string; getFilters: string }
) {
    const svc = service as any;
    const listQuery = useQuery({
        queryKey: [queryKey, 'list', filters, sortingState, pageIndex, pageSize],
        queryFn: () => svc[serviceMethods.getList]({
            filters,
            sortingState,
            page: pageIndex,
            limit: pageSize,
        }),
    });

    const filterOptionsQuery = useQuery({
        queryKey: [queryKey, 'filters'],
        queryFn: () => svc[serviceMethods.getFilters](),
    });

    return {
        listQuery,
        filterOptionsQuery,
        data: listQuery.data?.data || ([] as TData[]),
        paginationMeta: listQuery.data?.pagination,
        isLoading: listQuery.isLoading || filterOptionsQuery.isLoading,
        error: listQuery.error || filterOptionsQuery.error,
    };
}

// ========================================
// 4. FILTER CONFIG
// ========================================
function useFilterConfig(
    baseFilterConfig: TBaseFormFiltersConfig,
    filterOptionsData: Record<string, unknown> | undefined
): TBaseFormFiltersConfig {
    return buildFilterConfig(baseFilterConfig, filterOptionsData);
}

// ========================================
// 5. FILTER FORM
// ========================================
function useFilterForm(
    filters: Record<string, string>,
    setFilters: (filters: Record<string, string>) => void,
    setPageIndex: (index: number) => void
): TBaseFormApi {
    return useForm({
        defaultValues: filters,
        onSubmit: async ({ value }) => {
            setFilters(value);
            setPageIndex(0);
        },
    });
}

// ========================================
// 6. DERIVED STATE
// ========================================
function useDerivedState<TData>(
    data: TData[],
    filters: Record<string, string>,
    rowSelection: string[],
    isLoading: boolean
) {
    const selectedCount = rowSelection.length;
    const isEmpty = data.length === 0;

    return {
        isEmpty,
        hasActiveFilters: Object.keys(filters).length > 0,
        selectedCount,
        hasSelection: selectedCount > 0,
        isInitialLoad: isLoading && isEmpty,
    };
}

// ========================================
// 7. HANDLERS
// ========================================
function useHandlers(
    filterForm: TBaseFormApi,
    storeActions: ReturnType<typeof useStoreActions>,
    storeState: ReturnType<typeof useStoreState>
) {
    const handleFilterSubmit = useCallback(async() => {
        await filterForm.handleSubmit();
    }, [filterForm]);

    const handleFilterClear = useCallback(() => {
        filterForm.reset();
        storeActions.clearFilters();
        storeActions.setPageIndex(0);
    }, [filterForm, storeActions]);

    const handleSort = useCallback((columnId: string) => {
        const currentSort = storeState.sortingState;
        const existingSort = currentSort?.find(sort => sort.id === columnId);

        let newSortingState: TSortingState;

        if (existingSort) {
            if (existingSort.desc) {
                newSortingState = currentSort?.filter(sort => sort.id !== columnId) || [];
            } else {
                newSortingState = [{ id: columnId, desc: true }];
            }
        } else {
            newSortingState = [{ id: columnId, desc: false }];
        }

        storeActions.setSortingState(newSortingState.length > 0 ? newSortingState : null);
        storeActions.setPageIndex(0);
    }, [storeState.sortingState, storeActions]);

    const handleClearSelection = useCallback(() => {
        storeActions.clearSelection();
    }, [storeActions]);

    const handleOpenSelected = useCallback(() => {
        const selectedIds = storeState.rowSelection;
        console.log('Opening selected:', selectedIds);
    }, [storeState.rowSelection]);

    return {
        handleFilterSubmit,
        handleFilterClear,
        handleSort,
        handleClearSelection,
        handleOpenSelected,
    };
}

// ========================================
// 8. FACTORY FUNCTION
// ========================================
export function createListVM<
    TData,
    TStore extends TBaseListStoreHook,
    TService extends TBaseListService<TData>
>(
    config: TListVMFactoryConfig<TData, TStore, TService>
) {
    return function useListVM(): TBaseListViewModel<TData> {
        const serviceMethods = {
            getList: config.serviceMethods?.getList || 'getList',
            getFilters: config.serviceMethods?.getFilters || 'getFilters',
        };

        const storeState = useStoreState(config.store);
        const storeActions = useStoreActions(config.store);

        const serverQueries = useServerQueries<TData, TService>(
            config.service,
            config.queryKey,
            storeState.filters,
            storeState.sortingState,
            storeState.pagination.pageIndex,
            storeState.pagination.pageSize,
            serviceMethods
        );

        const filterConfig = useFilterConfig(
            config.filterConfig,
            serverQueries.filterOptionsQuery.data as Record<string, unknown> | undefined
        );

        const filterForm = useFilterForm(
            storeState.filters,
            storeActions.setFilters,
            storeActions.setPageIndex
        );

        const derived = useDerivedState<TData>(
            serverQueries.data,
            storeState.filters,
            storeState.rowSelection,
            serverQueries.isLoading
        );

        const handlers = useHandlers(filterForm, storeActions, storeState);

        return {
            config: {
                columns: config.columnConfig,
                filters: filterConfig,
                card: config.cardConfig,
                async: config.asyncConfig,
            },

            query: {
                data: serverQueries.data,
                isLoading: serverQueries.isLoading,
                isRefetching: serverQueries.listQuery.isLoading && serverQueries.data.length > 0,
                error: serverQueries.error,
                refetch: serverQueries.listQuery.refetch,
            },

            state: {
                filters: {
                    values: storeState.filters,
                    form: filterForm,
                },
                sorting: storeState.sortingState,
                pagination: {
                    pageIndex: storeState.pagination.pageIndex,
                    pageSize: storeState.pagination.pageSize,
                    totalPages: serverQueries.paginationMeta?.totalPages || 0,
                    totalItems: serverQueries.paginationMeta?.totalItems || 0,
                },
                selection: {
                    selectedIds: storeState.rowSelection,
                },
            },

            computed: {
                isEmpty: derived.isEmpty,
                hasActiveFilters: derived.hasActiveFilters,
                selectedCount: derived.selectedCount,
                hasSelection: derived.hasSelection,
                isInitialLoad: derived.isInitialLoad,
            },

            actions: {
                filtering: {
                    submit: handlers.handleFilterSubmit,
                    clear: handlers.handleFilterClear,
                    reset: storeActions.reset,
                },
                sorting: {
                    sort: handlers.handleSort,
                },
                pagination: {
                    goToPage: storeActions.setPageIndex,
                    changePageSize: storeActions.setPageSize,
                    nextPage: storeActions.nextPage,
                    previousPage: storeActions.previousPage,
                },
                selection: {
                    toggle: storeActions.toggleRow,
                    clear: handlers.handleClearSelection,
                    openSelected: handlers.handleOpenSelected,
                    selectAll: storeActions.selectAll,
                },
            },
        };
    };
}
