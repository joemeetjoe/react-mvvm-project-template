import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { RouteErrorBoundary } from './RouteErrorBoundary';

describe('RouteErrorBoundary', () => {
  it('reports a missing resource without offering a retry', () => {
    render(<RouteErrorBoundary error={new Error('user not found')} />);

    expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument();
    expect(
      screen.getByText('The page or resource you are looking for could not be found.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('reports a rejected request without offering a retry', () => {
    render(<RouteErrorBoundary error={new Error('Request failed with 403')} />);

    expect(screen.getByRole('heading', { name: 'Access Denied' })).toBeInTheDocument();
    expect(
      screen.getByText('You do not have permission to view this resource.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('shows the message of an unrecognised error and offers a retry', () => {
    render(<RouteErrorBoundary error={new Error('the network went away')} />);

    expect(screen.getByRole('heading', { name: 'Something Went Wrong' })).toBeInTheDocument();
    expect(screen.getByText('the network went away')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('falls back to a generic description when the error has no message', () => {
    render(<RouteErrorBoundary error={new Error('')} />);

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('goes back in history when asked', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const { user } = render(<RouteErrorBoundary error={new Error('boom')} />);

    await user.click(screen.getByRole('button', { name: 'Go Back' }));

    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });

  it('offers a way home and a way to retry the failed route', async () => {
    const { user } = render(<RouteErrorBoundary error={new Error('boom')} />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await user.click(screen.getByRole('button', { name: 'Go Home' }));

    expect(screen.getByRole('heading', { name: 'Something Went Wrong' })).toBeInTheDocument();
  });
});
