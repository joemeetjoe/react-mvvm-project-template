import { useForm } from '@tanstack/react-form';

import type { UserRole, UserStatus } from '../../data-layer/entities/user/userSchema';

// An empty string means "no filter", matching the route's search schema.
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

export type UserFilterForm = ReturnType<typeof useUserFilterForm>;
