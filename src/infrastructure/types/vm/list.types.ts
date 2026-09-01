
// viewmodels/lists.types.ts
import { TBaseViewModel } from "./types.ts";
import { TBaseFormFiltersConfig } from '../ui/filters.types.ts';
import { TBaseFormApi } from "../ui/forms.types.ts";
import { TBaseAsyncWrapperConfig } from "../ui/skeleton.types.ts";
import { TBaseColumnConfig } from "../ui/lists.types.ts";
import { TPaginationState, TSortingState } from "../data/stores.lists.types.ts";
import { TBaseListCardConfig } from "../ui/cards.types.ts";

// ========================================
// CONFIG GROUP
// ========================================
export interface TBaseListViewModelConfig {
    columns: TBaseColumnConfig;
    filters?: TBaseFormFiltersConfig;
    card: TBaseListCardConfig;
    async?: TBaseAsyncWrapperConfig;
}

// ========================================
// QUERY GROUP
// ========================================
export interface TBaseListViewModelQuery<TData = any> {
    data: TData[];
    isLoading: boolean;
    isRefetching: boolean;
    error: Error | null;
    refetch: () => void;
}

// ========================================
// STATE GROUP
// ========================================
export interface TBaseListViewModelStateFilters {
    values: Record<string, string>;
    form: TBaseFormApi;
}

export interface TBaseListViewModelStatePagination extends TPaginationState{
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface TBaseListViewModelStateSelection {
    selectedIds: string[];
}

export interface TBaseListViewModelState {
    filters: TBaseListViewModelStateFilters;
    sorting: TSortingState | null;
    pagination: TBaseListViewModelStatePagination;
    selection: TBaseListViewModelStateSelection;
}

// ========================================
// COMPUTED GROUP
// ========================================
export interface TBaseListViewModelComputed {
    isEmpty: boolean;
    hasActiveFilters: boolean;
    selectedCount: number;
    hasSelection: boolean;
    isInitialLoad: boolean;
}

// ========================================
// ACTIONS GROUP
// ========================================
export interface TBaseListViewModelActionsFiltering {
    submit: () => void;
    clear: () => void;
    reset: () => void;
}

export interface TBaseListViewModelActionsSorting {
    sort: (field: string) => void;
}

export interface TBaseListViewModelActionsPagination {
    goToPage: (pageIndex: number) => void;
    changePageSize: (pageSize: number) => void;
    nextPage: () => void;
    previousPage: () => void;
}

export interface TBaseListViewModelActionsSelection {
    toggle: (id: string) => void;
    clear: () => void;
    openSelected: () => void;
    selectAll: (ids: string[]) => void;
}

export interface TBaseListViewModelActions {
    filtering: TBaseListViewModelActionsFiltering;
    sorting: TBaseListViewModelActionsSorting;
    pagination: TBaseListViewModelActionsPagination;
    selection: TBaseListViewModelActionsSelection;
}

// ========================================
// MAIN VIEW MODEL
// ========================================
export interface TBaseListViewModel<TData = any> {
    config: TBaseListViewModelConfig;
    query: TBaseListViewModelQuery<TData>;
    state: TBaseListViewModelState;
    computed: TBaseListViewModelComputed;
    actions: TBaseListViewModelActions;
}

// ========================================
// RE-EXPORTS FOR createListVM CONSUMERS
// ========================================
export type { TBaseListStoreHook } from '../data/stores.lists.types';
export type { TSortingState } from '../data/stores.lists.types';
export type { TBaseListService } from '../api/listService.types';
export type { TBaseColumnConfig } from '../ui/lists.types';
export type { TBaseFormFiltersConfig } from '../ui/filters.types';
export type { TBaseListCardConfig } from '../ui/cards.types';
export type { TBaseAsyncWrapperConfig } from '../ui/skeleton.types';
export type { TBaseFormApi } from '../ui/forms.types';
