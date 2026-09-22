import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import {
  userFilterOptionsQueryOptions,
  userListQueryOptions,
} from '../../data-layer/entities/user/userQueries';
import type { SortDirection, UserSortField } from '../../data-layer/entities/user/userSchema';
import type { UserListViewProps } from './UserListView';
import { emptyUserFilterFormValues, useUserFilterForm } from './useUserFilterForm';
import type { UserFilterFormValues } from './useUserFilterForm';

const routeApi = getRouteApi('/mainLayout/protectedLayout/users');

export const useUserListViewModel = (): UserListViewProps => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { data, isFetching } = useSuspenseQuery(userListQueryOptions(search));
  const { data: filterOptions } = useSuspenseQuery(userFilterOptionsQueryOptions());

  const onSortChange = (sort: { field: UserSortField; direction: SortDirection }): void => {
    navigate({
      search: (prev) => ({ ...prev, sort: sort.field, direction: sort.direction, page: 1 }),
    });
  };

  const onPageChange = (page: number): void => {
    navigate({ search: (prev) => ({ ...prev, page }) });
  };

  const onPageSizeChange = (pageSize: number): void => {
    navigate({ search: (prev) => ({ ...prev, pageSize, page: 1 }) });
  };

  const filterDefaults: UserFilterFormValues = {
    search: search.search,
    role: search.role,
    status: search.status,
    department: search.department,
  };

  const onFilterSubmit = (values: UserFilterFormValues): void => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: values.search,
        role: values.role,
        status: values.status,
        department: values.department,
        page: 1,
      }),
    });
  };

  const form = useUserFilterForm(filterDefaults, onFilterSubmit);

  // Re-syncs the draft form when the URL changes outside a submission (e.g. browser back/forward).
  useEffect(() => {
    form.reset(filterDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.search, search.role, search.status, search.department]);

  const hasActiveFilters = Boolean(
    search.search || search.role || search.status || search.department,
  );

  const onClearFilters = (): void => {
    form.reset(emptyUserFilterFormValues);
    navigate({
      search: (prev) => ({
        ...prev,
        ...emptyUserFilterFormValues,
        page: 1,
      }),
    });
  };

  return {
    users: data.users,
    total: data.total,
    sort: { field: search.sort, direction: search.direction },
    page: search.page,
    pageSize: search.pageSize,
    isFetching,
    onSortChange,
    onPageChange,
    onPageSizeChange,
    form,
    filterOptions,
    hasActiveFilters,
    onClearFilters,
  };
};
