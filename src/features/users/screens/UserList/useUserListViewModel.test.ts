import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';

import { validateUserListSearch } from '../../routes/userListRoute';
import { userFixtures } from '../../data-layer/entities/user/userFixtures';
import { useUserListViewModel } from './useUserListViewModel';

const searchRoutes = [
  { id: '/mainLayout/protectedLayout/users', validateSearch: validateUserListSearch },
];

const setup = (initialRoute: string) =>
  renderHook(() => useUserListViewModel(), { initialRoute, searchRoutes });

describe('useUserListViewModel', () => {
  it('maps the default search params to the first page, sorted by first name', async () => {
    const { result } = setup('/users');

    await waitFor(() => {
      expect(result.current?.sort).toEqual({ field: 'firstName', direction: 'asc' });
    });

    expect(result.current?.page).toBe(1);
    expect(result.current?.pageSize).toBe(10);
    expect(result.current?.total).toBe(userFixtures.length);
    expect(result.current?.users).toHaveLength(10);
  });

  it('maps sort, direction, page and pageSize search params to the query', async () => {
    const { result } = setup('/users?sort=email&direction=desc&page=1&pageSize=20');

    await waitFor(() => {
      expect(result.current?.sort).toEqual({ field: 'email', direction: 'desc' });
    });

    expect(result.current?.page).toBe(1);
    expect(result.current?.pageSize).toBe(20);
    expect(result.current?.users).toHaveLength(userFixtures.length);
  });

  it('navigates to the new sort and resets to page 1 when onSortChange is called', async () => {
    const { result } = setup('/users?page=3');

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current?.onSortChange({ field: 'email', direction: 'desc' });

    await waitFor(() => {
      expect(result.current?.sort).toEqual({ field: 'email', direction: 'desc' });
    });

    expect(result.current?.page).toBe(1);
  });

  it('navigates to the requested page when onPageChange is called', async () => {
    const { result } = setup('/users');

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current?.onPageChange(2);

    await waitFor(() => {
      expect(result.current?.page).toBe(2);
    });
  });

  it('navigates to the new page size and resets to page 1 when onPageSizeChange is called', async () => {
    const { result } = setup('/users?page=2');

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current?.onPageSizeChange(20);

    await waitFor(() => {
      expect(result.current?.pageSize).toBe(20);
    });

    expect(result.current?.page).toBe(1);
  });

  it('initialises the filter form and filter options from the search params', async () => {
    const { result } = setup('/users?search=ada&role=admin');

    await waitFor(() => {
      expect(result.current?.form.state.values).toEqual({
        search: 'ada',
        role: 'admin',
        status: '',
        department: '',
      });
    });

    expect(result.current?.hasActiveFilters).toBe(true);
    expect(result.current?.filterOptions.roles).toContain('admin');
    expect(result.current?.filterOptions.departments.length).toBeGreaterThan(0);
  });

  it('has no active filters when none are applied', async () => {
    const { result } = setup('/users');

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.hasActiveFilters).toBe(false);
  });

  it('submitting the filter form writes the filters to the URL and resets to page 1', async () => {
    const { result } = setup('/users?page=3');

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    result.current?.form.setFieldValue('role', 'admin');
    await result.current?.form.handleSubmit();

    await waitFor(() => {
      expect(result.current?.hasActiveFilters).toBe(true);
    });
    expect(result.current?.page).toBe(1);
    expect(result.current?.users.every((candidate) => candidate.role === 'admin')).toBe(true);
  });

  it('clearing filters removes them from the URL, resets the form, and resets to page 1', async () => {
    const { result } = setup('/users?role=admin&page=2');

    await waitFor(() => {
      expect(result.current?.hasActiveFilters).toBe(true);
    });

    result.current?.onClearFilters();

    await waitFor(() => {
      expect(result.current?.hasActiveFilters).toBe(false);
    });
    expect(result.current?.page).toBe(1);
    expect(result.current?.form.state.values.role).toBe('');
    expect(result.current?.total).toBe(userFixtures.length);
  });
});
