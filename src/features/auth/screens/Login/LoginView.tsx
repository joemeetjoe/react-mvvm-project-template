import type { ChangeEvent, FormEvent, ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export type LoginViewProps = {
  email: string;
  password: string;
  isSubmitting: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: () => void;
};

export const LoginView = ({
  email,
  password,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginViewProps): ReactElement => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onEmailChange(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) => onPasswordChange(event.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mock auth: use admin@example.com or user@example.com with any password.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
