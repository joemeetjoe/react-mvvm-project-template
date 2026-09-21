import { useSearch } from '@tanstack/react-router';

import type { LoginFailedViewProps } from './LoginFailedView';

export const useLoginFailedViewModel = (): LoginFailedViewProps => {
  // `strict: false` reads the current search regardless of which route
  // matched, so this hook also works under the generic test host router
  // (shared/testing/render), which does not know this app's real route ids.
  const { redirect } = useSearch({ strict: false });

  return { redirectHref: redirect };
};
