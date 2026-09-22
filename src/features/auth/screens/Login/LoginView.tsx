import type { ReactElement } from 'react';

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
import { Text } from '@/shared/ui/typography';

import type { LoginForm } from './useLoginForm';

export type LoginViewProps = {
  form: LoginForm;
  isSubmitting: boolean;
  hint?: string;
};

const fields = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
] as const;

export const LoginView = ({ form, isSubmitting, hint }: LoginViewProps): ReactElement => (
  <div className="w-full max-w-md">
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access the application</CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <CardContent>
          <div className="flex flex-col gap-4">
            {fields.map(({ name, label, type }) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>{label}</Label>
                    <Input
                      id={field.name}
                      type={type}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text variant="destructive">
                        {field.state.meta.errors.map((error) => error?.message).join(', ')}
                      </Text>
                    )}
                  </div>
                )}
              </form.Field>
            ))}
            {hint && <CardDescription>{hint}</CardDescription>}
          </div>
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
