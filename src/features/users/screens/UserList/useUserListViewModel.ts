import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

import { userListQueryOptions } from '../../data-layer/entities/user/userQueries';
import type { SortDirection, UserSortField } from '../../data-layer/entities/user/userSchema';
import type { UserListViewProps } from './UserListView';

const routeApi = getRouteApi('/mainLayout/protectedLayout/users');

export const useUserListViewModel = (): UserListViewProps => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { data, isFetching } = useSuspenseQuery(userListQueryOptions(search));

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
  };
};
