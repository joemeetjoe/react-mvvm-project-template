import type { ReactElement } from 'react';

import { LoginFailedView } from './LoginFailedView';
import { useLoginFailedViewModel } from './useLoginFailedViewModel';

export const LoginFailed = (): ReactElement => {
  const props = useLoginFailedViewModel();

  return <LoginFailedView {...props} />;
};
