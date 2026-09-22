import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';

export type LoginFailedViewProps = {
  redirectHref?: string;
};

export const LoginFailedView = ({ redirectHref }: LoginFailedViewProps): ReactElement => (
  <div className="flex w-full max-w-md flex-col gap-4">
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>Authentication Failed</AlertTitle>
      <AlertDescription>
        We couldn't authenticate your credentials. Please try again.
      </AlertDescription>
    </Alert>
    <Button asChild className="w-full">
      <Link to="/" search={{ redirect: redirectHref }}>
        Try Again
      </Link>
    </Button>
  </div>
);
