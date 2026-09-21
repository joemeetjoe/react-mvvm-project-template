import { useForm } from '@tanstack/react-form';

import type { UserRole, UserStatus } from '../../data-layer/entities/user/userSchema';

// The draft filter values a TanStack Form manages (issue #6, decision 8). An
// empty string means "no filter", matching the route's search schema.
export type UserFilterFormValues = {
  search: string;
  role: UserRole | '';
  status: UserStatus | '';
  department: string;
};

export const emptyUserFilterFormValues: UserFilterFormValues = {
  search: '',
  role: '',
  status: '',
  department: '',
};

export const useUserFilterForm = (
  defaultValues: UserFilterFormValues,
  onSubmit: (values: UserFilterFormValues) => void,
) =>
  useForm({
    defaultValues,
    onSubmit: ({ value }) => onSubmit(value),
  });

// Crosses the ViewModel -> View boundary as a single `form` prop (decision 8).
export type UserFilterForm = ReturnType<typeof useUserFilterForm>;
