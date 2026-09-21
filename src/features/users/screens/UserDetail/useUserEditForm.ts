import { useForm } from '@tanstack/react-form';

import { userUpdateSchema } from '../../data-layer/entities/user/userSchema';
import type { UserUpdate } from '../../data-layer/entities/user/userSchema';

/**
 * The small colocated form hook decision 8 calls for: the ViewModel builds the
 * form here, and the View types its single `form` prop from this hook's
 * return type via a type-only import, rather than importing `@tanstack/react-form`
 * itself.
 */
export const useUserEditForm = (
  defaultValues: UserUpdate,
  onSubmit: (values: UserUpdate) => Promise<void> | void,
) =>
  useForm({
    defaultValues,
    validators: { onChange: userUpdateSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

export type UserEditForm = ReturnType<typeof useUserEditForm>;
