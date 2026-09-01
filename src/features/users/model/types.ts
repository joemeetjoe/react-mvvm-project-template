export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  department: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface UserFilterOptions {
  role: FilterOption[];
  status: FilterOption[];
  department: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}

// Request/Response types
export interface GetUsersListParams {
  filters?: Record<string, string>;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  page?: number;
  limit?: number;
}

export interface GetUsersListResponse {
  data: User[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetUserDetailParams {
  userId: string;
}

export type GetUserDetailResponse = User;

export type GetUserFiltersParams = void;
export type GetUserFiltersResponse = UserFilterOptions;

export interface UpdateUserParams {
  userId: string;
  data: Partial<User>;
}

export type UpdateUserResponse = User;

export interface DeleteUserParams {
  userId: string;
}

export type DeleteUserResponse = void;

// View config types
export type TUsersColumnConfig = import('@tanstack/react-table').ColumnDef<User>[];
export type TUsersListFiltersConfig = import('@/infrastructure/types/ui/filters.types').TBaseFormFiltersConfig;
export type TUsersListCardConfig = import('@/infrastructure/types/ui/cards.types').TBaseListCardConfig;
