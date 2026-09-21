import type { ReactElement } from 'react';

import { LoginView } from './LoginView';
import { useLoginViewModel } from './useLoginViewModel';

export const Login = (): ReactElement => {
  const props = useLoginViewModel();

  return <LoginView {...props} />;
};
