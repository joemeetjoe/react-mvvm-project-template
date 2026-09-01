
// src/commonTypes/store.ts
import {
    SortingState as TSortingState,
    PaginationState as TPaginationState,
    RowSelectionState as TRowSelectionState,
} from '@tanstack/react-table';

export type { TSortingState };
export type { TPaginationState };
export type { TRowSelectionState };

export interface TBaseSelectionSlice {
    rowSelection: string[];
    toggleRow: (id: string) => void;
    clearSelection: () => void;
    selectAll: (ids: string[]) => void;
}

export interface TBaseFiltersSlice {
    filters: Record<string, string>;
    setFilters: (filters: Record<string, string>) => void;
    clearFilters: () => void;
}

export interface TBaseSortSlice {
    sortingState: TSortingState | null;
    setSortingState: (sortConfig: TSortingState | null) => void;
    clearSort: () => void;
}

export type TBasePaginationSlice = {
    pagination: TPaginationState;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    setPagination: (pagination: TPaginationState) => void;
    nextPage: () => void;
    previousPage: () => void;
    resetPagination: () => void;
}

interface TResetSlice {
    reset: () => void;
}

export interface TBaseListUIStore
    extends TBaseSelectionSlice, TBaseFiltersSlice, TBasePaginationSlice, TBaseSortSlice, TResetSlice {
}

export type TBaseListUISelectors = {
    rowSelection: (state: TBaseListUIStore) => string[];
    filters: (state: TBaseListUIStore) => Record<string, string>;
    sortingState: (state: TBaseListUIStore) => TSortingState | null;
    hasSelection: (state: TBaseListUIStore) => boolean;
    selectedCount: (state: TBaseListUIStore) => number;
    isRowSelected: (state: TBaseListUIStore, id: string) => boolean;
    pagination: (state: TBaseListUIStore) => TPaginationState;
    pageIndex: (state: TBaseListUIStore) => number;
    pageSize: (state: TBaseListUIStore) => number;
    currentPage: (state: TBaseListUIStore) => number;
};

export type TBaseListStoreHook = <T>(
    selector: (state: TBaseListUIStore) => T
) => T;
