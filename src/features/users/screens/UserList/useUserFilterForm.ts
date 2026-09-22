import { useForm } from '@tanstack/react-form';

import { emptyUserListFilter } from '../../data-layer/entities/user/userSchema';

// The draft the user is typing into. Every field is a plain string because
// every widget yields one; the ViewModel parses the draft with
// `userListFilterSchema` on submit, so the View never narrows a value.
export type UserFilterFormValues = {
  search: string;
  role: string;
  status: string;
  department: string;
};

export const emptyUserFilterFormValues: UserFilterFormValues = emptyUserListFilter;

export const useUserFilterForm = (
  defaultValues: UserFilterFormValues,
  onSubmit: (values: UserFilterFormValues) => void,
) =>
  useForm({
    defaultValues,
    onSubmit: ({ value }) => onSubmit(value),
  });

export type UserFilterForm = ReturnType<typeof useUserFilterForm>;
