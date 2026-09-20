import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { LoginView } from './LoginView';
import type { LoginViewProps } from './LoginView';

const baseProps: LoginViewProps = {
  email: 'admin@example.com',
  password: 'password',
  isSubmitting: false,
  onEmailChange: vi.fn(),
  onPasswordChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe('LoginView', () => {
  it('renders the prefilled credentials', () => {
    render(<LoginView {...baseProps} />);

    expect(screen.getByLabelText(/email/i)).toHaveValue('admin@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password');
  });

  it('reports email and password changes', async () => {
    const onEmailChange = vi.fn();
    const onPasswordChange = vi.fn();
    const { user } = render(
      <LoginView {...baseProps} onEmailChange={onEmailChange} onPasswordChange={onPasswordChange} />,
    );

    await user.type(screen.getByLabelText(/email/i), 'x');
    await user.type(screen.getByLabelText(/password/i), 'y');

    expect(onEmailChange).toHaveBeenCalled();
    expect(onPasswordChange).toHaveBeenCalled();
  });

  it('submits the form', async () => {
    const onSubmit = vi.fn();
    const { user } = render(<LoginView {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('disables the submit button while submitting', () => {
    render(<LoginView {...baseProps} isSubmitting />);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
