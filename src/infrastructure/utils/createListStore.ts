
// src/core/store/createListStore.ts
import { create, StateCreator } from 'zustand';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import type {
    TBaseListUIStore,
    TBaseSelectionSlice,
    TBaseFiltersSlice,
    TBaseSortSlice,
    TBasePaginationSlice,
    TBaseListUISelectors,
    TSortingState,
    TPaginationState,
} from '@/infrastructure/types/data/stores.lists.types';

// ========================================
// FACTORY CONFIGURATION
// ========================================
export type TListStoreConfig = {
    name: string;
    initialState?: {
        pageSize?: number;
        pageIndex?: number;
    };
    devtools?: boolean;
};

// ========================================
// SLICE CREATORS
// ========================================
const createSelectionSlice: StateCreator<
    TBaseListUIStore,
    [['zustand/devtools', never]],
    [],
    TBaseSelectionSlice
> = (set) => ({
    rowSelection: [],

    toggleRow: (id: string) =>
        set(
            (state) => ({
                rowSelection: state.rowSelection.includes(id)
                    ? state.rowSelection.filter((rowId) => rowId !== id)
                    : [...state.rowSelection, id],
            }),
            false,
            'toggleRow'
        ),

    clearSelection: () =>
        set({ rowSelection: [] }, false, 'clearSelection'),

    selectAll: (ids: string[]) =>
        set({ rowSelection: ids }, false, 'selectAll'),
});

const createFiltersSlice: StateCreator<
    TBaseListUIStore,
    [['zustand/devtools', never]],
    [],
    TBaseFiltersSlice
> = (set) => ({
    filters: {},

    setFilters: (filters: Record<string, string>) =>
        set({ filters }, false, 'setFilters'),

    clearFilters: () =>
        set({ filters: {} }, false, 'clearFilters'),
});

const createSortSlice: StateCreator<
    TBaseListUIStore,
    [['zustand/devtools', never]],
    [],
    TBaseSortSlice
> = (set) => ({
    sortingState: null,

    setSortingState: (sortingState: TSortingState | null) =>
        set({ sortingState }, false, 'setSortingState'),

    clearSort: () =>
        set({ sortingState: null }, false, 'clearSort'),
});

const createPaginationSlice = (
    initialPageSize: number,
    initialPageIndex: number
): StateCreator<
    TBaseListUIStore,
    [['zustand/devtools', never]],
    [],
    TBasePaginationSlice
> => (set) => ({
    pagination: {
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
    },

    setPageIndex: (pageIndex: number) =>
        set(
            (state) => ({
                pagination: {
                    ...state.pagination,
                    pageIndex,
                },
            }),
            false,
            'setPageIndex'
        ),

    setPageSize: (pageSize: number) =>
        set(
            (state) => ({
                pagination: {
                    ...state.pagination,
                    pageSize,
                    pageIndex: 0, // Reset to first page when changing page size
                },
            }),
            false,
            'setPageSize'
        ),

    setPagination: (pagination: TPaginationState) =>
        set({ pagination }, false, 'setPagination'),

    nextPage: () =>
        set(
            (state) => ({
                pagination: {
                    ...state.pagination,
                    pageIndex: state.pagination.pageIndex + 1,
                },
            }),
            false,
            'nextPage'
        ),

    previousPage: () =>
        set(
            (state) => ({
                pagination: {
                    ...state.pagination,
                    pageIndex: Math.max(0, state.pagination.pageIndex - 1),
                },
            }),
            false,
            'previousPage'
        ),

    resetPagination: () =>
        set(
            {
                pagination: {
                    pageIndex: initialPageIndex,
                    pageSize: initialPageSize,
                },
            },
            false,
            'resetPagination'
        ),
});

// ========================================
// SELECTORS FACTORY
// ========================================
const createSelectors = (): TBaseListUISelectors => ({
    rowSelection: (state) => state.rowSelection,
    filters: (state) => state.filters,
    sortingState: (state) => state.sortingState,
    hasSelection: (state) => state.rowSelection.length > 0,
    selectedCount: (state) => state.rowSelection.length,
    isRowSelected: (state, id) => state.rowSelection.includes(id),
    pagination: (state) => state.pagination,
    pageIndex: (state) => state.pagination.pageIndex,
    pageSize: (state) => state.pagination.pageSize,
    currentPage: (state) => state.pagination.pageIndex + 1,
});

// ========================================
// FACTORY FUNCTION
// ========================================
export function createListStore(config: TListStoreConfig) {
    const pageSize = config.initialState?.pageSize ?? 10;
    const pageIndex = config.initialState?.pageIndex ?? 0;
    const enableDevtools = config.devtools ?? import.meta.env.DEV;

    const useStore = create<TBaseListUIStore>()(
        devtools(
            (set, get, api) => ({
                ...createSelectionSlice(set, get, api),
                ...createFiltersSlice(set, get, api),
                ...createSortSlice(set, get, api),
                ...createPaginationSlice(pageSize, pageIndex)(set, get, api),

                reset: () =>
                    set(
                        {
                            rowSelection: [],
                            filters: {},
                            sortingState: null,
                            pagination: {
                                pageIndex,
                                pageSize,
                            },
                        },
                        false,
                        'reset'
                    ),
            }),
            {
                name: config.name,
                enabled: enableDevtools,
            } as DevtoolsOptions
        )
    );

    const selectors = createSelectors();

    return {
        useStore,
        selectors,
    };
}
