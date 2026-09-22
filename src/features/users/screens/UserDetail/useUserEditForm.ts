import { useForm } from '@tanstack/react-form';

import { userUpdateSchema } from '../../data-layer/entities/user/userSchema';
import type { UserUpdate } from '../../data-layer/entities/user/userSchema';

// The draft the user is editing. Every field is a plain string because every
// widget yields one; `userUpdateSchema` validates each change and narrows the
// draft on submit, so the View never casts a value.
export type UserUpdateDraft = { [K in keyof UserUpdate]: string };

export const useUserEditForm = (
  defaultValues: UserUpdateDraft,
  onSubmit: (values: UserUpdate) => Promise<void> | void,
) =>
  useForm({
    defaultValues,
    validators: { onChange: userUpdateSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(userUpdateSchema.parse(value));
    },
  });

export type UserEditForm = ReturnType<typeof useUserEditForm>;
