import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';

export const createMockListVM = (overrides: Partial<TBaseListViewModel> = {}): TBaseListViewModel => ({
  config: {
    columns: [],
    filters: undefined,
    card: { title: 'Test List', detailsPath: '/test', showOpenSelectedButton: false },
    async: undefined,
  },
  query: {
    data: [],
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: () => {},
  },
  state: {
    filters: {
      values: {},
      form: undefined as any,
    },
    sorting: null,
    pagination: {
      pageIndex: 0,
      pageSize: 10,
      totalPages: 0,
      totalItems: 0,
    },
    selection: {
      selectedIds: [],
    },
  },
  computed: {
    isEmpty: true,
    hasActiveFilters: false,
    selectedCount: 0,
    hasSelection: false,
    isInitialLoad: false,
  },
  actions: {
    filtering: {
      submit: () => {},
      clear: () => {},
      reset: () => {},
    },
    sorting: {
      sort: () => {},
    },
    pagination: {
      goToPage: () => {},
      changePageSize: () => {},
      nextPage: () => {},
      previousPage: () => {},
    },
    selection: {
      toggle: () => {},
      clear: () => {},
      openSelected: () => {},
      selectAll: () => {},
    },
  },
  ...overrides,
});
