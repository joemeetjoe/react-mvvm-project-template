import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import type { LoginCredentials } from '../../data-layer/entities/session/sessionSchema';
import { LoginView } from './LoginView';
import type { LoginViewProps } from './LoginView';
import { emptyLoginCredentials, useLoginForm } from './useLoginForm';

// A real TanStack Form instance can only be created inside a component, hence this harness.
type HarnessProps = Omit<LoginViewProps, 'form'> & {
  defaultValues?: LoginCredentials;
  onSubmit?: (credentials: LoginCredentials) => void;
};

const LoginViewHarness = ({
  defaultValues = emptyLoginCredentials,
  onSubmit = vi.fn(),
  ...rest
}: HarnessProps): ReactElement => {
  const form = useLoginForm(defaultValues, onSubmit);

  return <LoginView {...rest} form={form} />;
};

describe('LoginView', () => {
  it('renders the credentials the form starts with', () => {
    render(
      <LoginViewHarness
        isSubmitting={false}
        defaultValues={{ email: 'admin@example.com', password: 'password' }}
      />,
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue('admin@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password');
  });

  it('submits the typed credentials', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<LoginViewHarness isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'secret' });
  });

  it('shows validation errors and does not submit when the credentials are invalid', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<LoginViewHarness isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the submit button while submitting', () => {
    render(<LoginViewHarness isSubmitting />);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('renders the hint when one is given', () => {
    render(<LoginViewHarness isSubmitting={false} hint="Any password works here." />);

    expect(screen.getByText('Any password works here.')).toBeInTheDocument();
  });

  it('renders no hint when none is given', () => {
    render(<LoginViewHarness isSubmitting={false} />);

    expect(screen.queryByText(/password works/i)).not.toBeInTheDocument();
  });
});
