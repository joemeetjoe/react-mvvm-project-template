import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';

import { sessionMutations } from '../../data-layer/entities/session/sessionQueries';
import type { LoginViewProps } from './LoginView';

const defaultLandingHref = '/users';

export const useLoginViewModel = (): LoginViewProps => {
  // `strict: false` reads the current search regardless of which route
  // matched, so this hook also works under the generic test host router
  // (shared/testing/render), which does not know this app's real route ids.
  const { redirect } = useSearch({ strict: false });
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');

  const loginMutation = useMutation(sessionMutations.login());

  const handleSubmit = (): void => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          void navigate({ href: redirect ?? defaultLandingHref });
        },
        onError: () => {
          void navigate({ to: '/login-failed', search: { redirect } });
        },
      },
    );
  };

  return {
    email,
    password,
    isSubmitting: loginMutation.isPending,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit: handleSubmit,
  };
};
