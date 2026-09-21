import { functionalUpdate } from '@tanstack/react-table';
import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import type { ReactElement } from 'react';

import { DataTable } from '@/shared/components/DataTable';

import type { SortDirection, User, UserSortField } from '../../data-layer/entities/user/userSchema';

export type UserListViewProps = {
  users: User[];
  total: number;
  sort: { field: UserSortField; direction: SortDirection };
  page: number;
  pageSize: number;
  isFetching: boolean;
  onSortChange: (sort: { field: UserSortField; direction: SortDirection }) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const pageSizeOptions = [10, 20, 50] as const;

const columns: ColumnDef<User, string>[] = [
  {
    id: 'firstName',
    header: 'Name',
    accessorFn: (user) => `${user.firstName} ${user.lastName}`,
  },
  { id: 'email', accessorKey: 'email', header: 'Email' },
  { id: 'department', accessorKey: 'department', header: 'Department' },
  { id: 'role', accessorKey: 'role', header: 'Role' },
  { id: 'status', accessorKey: 'status', header: 'Status' },
];

export const UserListView = ({
  users,
  total,
  sort,
  page,
  pageSize,
  isFetching,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: UserListViewProps): ReactElement => {
  const sorting: SortingState = [{ id: sort.field, desc: sort.direction === 'desc' }];
  const pagination: PaginationState = { pageIndex: page - 1, pageSize };
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // `enableSortingRemoval: false` on the DataTable guarantees exactly one
  // sort entry after any toggle, so `next` is never empty here.
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [next] = functionalUpdate(updater, sorting);

    onSortChange({ field: next.id as UserSortField, direction: next.desc ? 'desc' : 'asc' });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = functionalUpdate(updater, pagination);

    if (next.pageSize !== pagination.pageSize) {
      onPageSizeChange(next.pageSize);
    } else {
      onPageChange(next.pageIndex + 1);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      <DataTable
        columns={columns}
        data={users}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        pageCount={pageCount}
        pageSizeOptions={pageSizeOptions}
        isFetching={isFetching}
        emptyMessage="No users to show."
      />
    </section>
  );
};
