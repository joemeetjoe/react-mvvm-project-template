import { useForm } from '@tanstack/react-form';

import { userUpdateSchema } from '../../data-layer/entities/user/userSchema';
import type { UserUpdate } from '../../data-layer/entities/user/userSchema';

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
