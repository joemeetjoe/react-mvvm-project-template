import { create, type StateCreator } from 'zustand';
import { devtools, type DevtoolsOptions } from 'zustand/middleware';
import type { TBaseListUIStore } from '@/infrastructure/types/data/stores.lists.types';

// ========================================
// USERS LIST UI STORE
// ========================================

export type TUsersListUIStore = TBaseListUIStore;

type TSelectionSlice = Pick<TUsersListUIStore, 'rowSelection' | 'toggleRow' | 'clearSelection' | 'selectAll'>;
type TFiltersSlice = Pick<TUsersListUIStore, 'filters' | 'setFilters' | 'clearFilters'>;
type TSortSlice = Pick<TUsersListUIStore, 'sortingState' | 'setSortingState' | 'clearSort'>;
type TPaginationSlice = Pick<TUsersListUIStore, 'pagination' | 'setPageIndex' | 'setPageSize' | 'setPagination' | 'nextPage' | 'previousPage' | 'resetPagination'>;

const createSelectionSlice: StateCreator<
  TUsersListUIStore, [['zustand/devtools', never]], [], TSelectionSlice
> = (set) => ({
  rowSelection: [],
  toggleRow: (id: string) =>
    set(
      (state) => ({
        rowSelection: state.rowSelection.includes(id)
          ? state.rowSelection.filter((rowId) => rowId !== id)
          : [...state.rowSelection, id],
      }),
      false, 'toggleRow'
    ),
  clearSelection: () => set({ rowSelection: [] }, false, 'clearSelection'),
  selectAll: (ids: string[]) => set({ rowSelection: ids }, false, 'selectAll'),
});

const createFiltersSlice: StateCreator<
  TUsersListUIStore, [['zustand/devtools', never]], [], TFiltersSlice
> = (set) => ({
  filters: {},
  setFilters: (filters: Record<string, string>) => set({ filters }, false, 'setFilters'),
  clearFilters: () => set({ filters: {} }, false, 'clearFilters'),
});

const createSortSlice: StateCreator<
  TUsersListUIStore, [['zustand/devtools', never]], [], TSortSlice
> = (set) => ({
  sortingState: null,
  setSortingState: (sortingState) => set({ sortingState }, false, 'setSortConfig'),
  clearSort: () => set({ sortingState: null }, false, 'clearSort'),
});

const createPaginationSlice: StateCreator<
  TUsersListUIStore, [['zustand/devtools', never]], [], TPaginationSlice
> = (set) => ({
  pagination: { pageIndex: 0, pageSize: 10 },
  setPageIndex: (pageIndex: number) =>
    set((state) => ({ pagination: { ...state.pagination, pageIndex } } as Partial<TUsersListUIStore>), false, 'setPageIndex'),
  setPageSize: (pageSize: number) =>
    set((state) => ({ pagination: { ...state.pagination, pageSize, pageIndex: 0 } } as Partial<TUsersListUIStore>), false, 'setPageSize'),
  setPagination: (pagination) =>
    set({ pagination } as Partial<TUsersListUIStore>, false, 'setPagination'),
  nextPage: () =>
    set((state) => ({ pagination: { ...state.pagination, pageIndex: state.pagination.pageIndex + 1 } } as Partial<TUsersListUIStore>), false, 'nextPage'),
  previousPage: () =>
    set((state) => ({ pagination: { ...state.pagination, pageIndex: Math.max(0, state.pagination.pageIndex - 1) } } as Partial<TUsersListUIStore>), false, 'previousPage'),
  resetPagination: () =>
    set({ pagination: { pageIndex: 0, pageSize: 10 } } as Partial<TUsersListUIStore>, false, 'resetPagination'),
});

export const useUsersUIStore = create<TUsersListUIStore>()(
  devtools(
    (set, get, api) => ({
      ...createSelectionSlice(set, get, api),
      ...createFiltersSlice(set, get, api),
      ...createSortSlice(set, get, api),
      ...createPaginationSlice(set, get, api),
      reset: () =>
        set(
          { rowSelection: [], filters: {}, sortingState: null, pagination: { pageIndex: 0, pageSize: 10 } },
          false, 'reset'
        ),
    }),
    { name: 'UsersUIStore', enabled: import.meta.env.DEV } as DevtoolsOptions
  )
);

export const usersUISelectors = {
  rowSelection: (state: TUsersListUIStore) => state.rowSelection,
  filters: (state: TUsersListUIStore) => state.filters,
  sortingState: (state: TUsersListUIStore) => state.sortingState,
  hasSelection: (state: TUsersListUIStore) => state.rowSelection.length > 0,
  selectedCount: (state: TUsersListUIStore) => state.rowSelection.length,
  isRowSelected: (state: TUsersListUIStore, id: string) => state.rowSelection.includes(id),
  pagination: (state: TUsersListUIStore) => state.pagination,
  pageIndex: (state: TUsersListUIStore) => state.pagination.pageIndex,
  pageSize: (state: TUsersListUIStore) => state.pagination.pageSize,
  currentPage: (state: TUsersListUIStore) => state.pagination.pageIndex + 1,
};
