import { describe, expect, it } from 'vitest';

import { useSessionStore } from '@/shared/stores/sessionStore';
import { renderRoute, screen } from '@/shared/testing/render';

describe('auth', () => {
  it('redirects an unauthenticated visitor to login, then returns them to the page they asked for', async () => {
    const { user } = renderRoute({ initialRoute: '/users', session: null });

    expect(await screen.findByText(/enter your credentials/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
  });

  it('lands on the default page after signing in with no prior destination', async () => {
    const { user } = renderRoute({ initialRoute: '/', session: null });

    await screen.findByText(/enter your credentials/i);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
  });

  it('shows the login-failed screen and does not create a session for bad credentials', async () => {
    const { user } = renderRoute({ initialRoute: '/', session: null });

    const emailInput = await screen.findByLabelText(/email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'nobody@example.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/authentication failed/i)).toBeInTheDocument();
    expect(useSessionStore.getState().token).toBeNull();
  });

  it('links back to login with no redirect target when login-failed is visited directly', async () => {
    renderRoute({ initialRoute: '/login-failed', session: null });

    expect(await screen.findByRole('link', { name: /try again/i })).toHaveAttribute('href', '/');
  });

  it('logging out clears the session and returns to login', async () => {
    const { user } = renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(await screen.findByText(/enter your credentials/i)).toBeInTheDocument();
    expect(useSessionStore.getState().token).toBeNull();
  });
});
