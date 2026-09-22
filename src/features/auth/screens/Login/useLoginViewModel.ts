import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { isApiMocked } from '@/shared/lib/env';

import { demoLoginCredentials, demoLoginHint } from '../../data-layer/entities/session/sessionFixtures';
import { sessionMutations } from '../../data-layer/entities/session/sessionQueries';
import type { LoginViewProps } from './LoginView';
import { emptyLoginCredentials, useLoginForm } from './useLoginForm';

const defaultLandingHref = '/users';

export const useLoginViewModel = (): LoginViewProps => {
  // `strict: false` reads the current search regardless of which route
  // matched, so this hook also works under the generic test host router
  // (shared/testing/render), which does not know this app's real route ids.
  const { redirect } = useSearch({ strict: false });
  const navigate = useNavigate();
  const loginMutation = useMutation(sessionMutations.login());

  // Demo credentials exist only while the MSW worker answers the API.
  const isMocked = isApiMocked();

  const form = useLoginForm(isMocked ? demoLoginCredentials : emptyLoginCredentials, (credentials) => {
    loginMutation.mutate(credentials, {
      onSuccess: () => {
        void navigate({ href: redirect ?? defaultLandingHref });
      },
      onError: () => {
        void navigate({ to: '/login-failed', search: { redirect } });
      },
    });
  });

  return {
    form,
    isSubmitting: loginMutation.isPending,
    hint: isMocked ? demoLoginHint : undefined,
  };
};
