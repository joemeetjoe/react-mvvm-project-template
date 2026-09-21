import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';

import { validateUserListSearch } from '../../routes/userListRoute';
import { userFixtures } from '../../data-layer/entities/user/userFixtures';
import { useUserListViewModel } from './useUserListViewModel';

const searchRoutes = [{ path: 'users', validateSearch: validateUserListSearch }];

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
    const { result } = setup('/users?sort=email&direction=desc&page=2&pageSize=5');

    await waitFor(() => {
      expect(result.current?.sort).toEqual({ field: 'email', direction: 'desc' });
    });

    expect(result.current?.page).toBe(2);
    expect(result.current?.pageSize).toBe(5);
    expect(result.current?.users).toHaveLength(5);
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
});
