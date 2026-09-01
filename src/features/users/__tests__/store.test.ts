import { describe, it, expect, beforeEach } from 'vitest';
import { useUsersUIStore } from '../model/store';

describe('UsersUIStore', () => {
  beforeEach(() => {
    useUsersUIStore.setState({
      rowSelection: [],
      filters: {},
      sortingState: null,
      pagination: { pageIndex: 0, pageSize: 10 },
    } as any);
  });

  describe('selection slice', () => {
    it('should start with empty selection', () => {
      const state = useUsersUIStore.getState();
      expect(state.rowSelection).toEqual([]);
    });

    it('should toggle a row', () => {
      useUsersUIStore.getState().toggleRow('row-1');
      expect(useUsersUIStore.getState().rowSelection).toContain('row-1');
    });

    it('should clear selection', () => {
      useUsersUIStore.getState().toggleRow('row-1');
      useUsersUIStore.getState().clearSelection();
      expect(useUsersUIStore.getState().rowSelection).toEqual([]);
    });
  });

  describe('pagination slice', () => {
    it('should start with default pagination', () => {
      const state = useUsersUIStore.getState();
      expect(state.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    });

    it('should update pagination', () => {
      useUsersUIStore.getState().setPagination({ pageIndex: 2, pageSize: 25 });
      expect(useUsersUIStore.getState().pagination).toEqual({ pageIndex: 2, pageSize: 25 });
    });
  });

  describe('sort slice', () => {
    it('should start with no sorting', () => {
      const state = useUsersUIStore.getState();
      expect(state.sortingState).toBeNull();
    });

    it('should update sorting', () => {
      useUsersUIStore.getState().setSortingState([{ id: 'lastName', desc: false }]);
      expect(useUsersUIStore.getState().sortingState).toEqual([{ id: 'lastName', desc: false }]);
    });
  });

  describe('filter slice', () => {
    it('should start with empty filters', () => {
      const state = useUsersUIStore.getState();
      expect(state.filters).toEqual({});
    });

    it('should set filters', () => {
      useUsersUIStore.getState().setFilters({ status: 'active' });
      expect(useUsersUIStore.getState().filters).toEqual({ status: 'active' });
    });

    it('should clear all filters', () => {
      useUsersUIStore.getState().setFilters({ status: 'active', role: 'admin' });
      useUsersUIStore.getState().clearFilters();
      expect(useUsersUIStore.getState().filters).toEqual({});
    });
  });
});
