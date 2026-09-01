import type { TUsersColumnConfig, TUsersListFiltersConfig, TUsersListCardConfig } from '../model/types';

export const usersListColumnConfig: TUsersColumnConfig = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
];

export const usersListFilterConfig: TUsersListFiltersConfig = {
  textFilters: [
    {
      id: 'search',
      label: 'Search',
      placeholder: 'Search users...',
      type: 'text',
    },
  ],
  selectFilters: [
    {
      id: 'role',
      name: 'Role',
      label: 'Role',
      type: 'select',
    },
    {
      id: 'status',
      name: 'Status',
      label: 'Status',
      type: 'select',
    },
    {
      id: 'department',
      name: 'Department',
      label: 'Department',
      type: 'select',
    },
  ],
};

export const usersListCardConfig: TUsersListCardConfig = {
  title: 'Users',
  detailsPath: '/users',
  showOpenSelectedButton: true,
};
