import { functionalUpdate } from '@tanstack/react-table';
import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';

import { DataTable } from '@/shared/components/DataTable';
import { FilterCard } from '@/shared/components/FilterCard';
import type { FilterFieldConfig } from '@/shared/components/FilterCard';
import { Heading } from '@/shared/ui/typography';

import type {
  SortDirection,
  User,
  UserFilterOptions,
  UserSortField,
} from '../../data-layer/entities/user/userSchema';
import type { UserFilterForm } from './useUserFilterForm';

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
  form: UserFilterForm;
  filterOptions: UserFilterOptions;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

const pageSizeOptions = [10, 20, 50] as const;

const columns: ColumnDef<User, string>[] = [
  {
    id: 'firstName',
    header: 'Name',
    accessorFn: (user) => `${user.firstName} ${user.lastName}`,
    cell: (info) => (
      <Link to="/users/$userId" params={{ userId: info.row.original.id }}>
        {info.getValue()}
      </Link>
    ),
  },
  { id: 'email', accessorKey: 'email', header: 'Email' },
  { id: 'department', accessorKey: 'department', header: 'Department' },
  { id: 'role', accessorKey: 'role', header: 'Role' },
  { id: 'status', accessorKey: 'status', header: 'Status' },
];

// Filter options come from the data-layer query, not from constants here
// (issue #6) — this only shapes them into the shared FilterCard's field config.
const buildFilterFields = (filterOptions: UserFilterOptions): FilterFieldConfig[] => [
  { id: 'search', label: 'Search', kind: 'text', placeholder: 'Name or email' },
  {
    id: 'role',
    label: 'Role',
    kind: 'select',
    options: filterOptions.roles.map((role) => ({ value: role, label: role })),
  },
  {
    id: 'status',
    label: 'Status',
    kind: 'select',
    options: filterOptions.statuses.map((status) => ({ value: status, label: status })),
  },
  {
    id: 'department',
    label: 'Department',
    kind: 'select',
    options: filterOptions.departments.map((department) => ({ value: department, label: department })),
  },
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
  form,
  filterOptions,
  hasActiveFilters,
  onClearFilters,
}: UserListViewProps): ReactElement => {
  const sorting: SortingState = [{ id: sort.field, desc: sort.direction === 'desc' }];
  const pagination: PaginationState = { pageIndex: page - 1, pageSize };
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const filterFields = buildFilterFields(filterOptions);

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
      <Heading level="h1">Users</Heading>

      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <FilterCard
            fields={filterFields}
            values={values as Record<string, string>}
            onValueChange={(id, value) => form.setFieldValue(id as never, value as never)}
            onSubmit={() => {
              void form.handleSubmit();
            }}
            onClear={onClearFilters}
            hasActiveFilters={hasActiveFilters}
            isSubmitDisabled={isFetching}
          />
        )}
      </form.Subscribe>

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
