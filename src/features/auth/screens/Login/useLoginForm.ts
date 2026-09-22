import { useForm } from '@tanstack/react-form';

import { loginCredentialsSchema } from '../../data-layer/entities/session/sessionSchema';
import type { LoginCredentials } from '../../data-layer/entities/session/sessionSchema';

export const emptyLoginCredentials: LoginCredentials = { email: '', password: '' };

export const useLoginForm = (
  defaultValues: LoginCredentials,
  onSubmit: (credentials: LoginCredentials) => void,
) =>
  useForm({
    defaultValues,
    validators: { onChange: loginCredentialsSchema },
    onSubmit: ({ value }) => onSubmit(value),
  });

export type LoginForm = ReturnType<typeof useLoginForm>;
