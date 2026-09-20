import { describe, expect, it } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { UserListView } from './UserListView';
import type { UserListViewProps } from './UserListView';

const props: UserListViewProps = {
  users: [
    {
      id: 'USR-001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada.lovelace@example.com',
      role: 'admin',
      status: 'active',
      department: 'Engineering',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-11-20T14:30:00Z',
    },
  ],
};

describe('UserListView', () => {
  it('renders a row for each user', () => {
    render(<UserListView {...props} />);

    const row = screen.getByRole('row', { name: /Ada Lovelace/ });

    expect(row).toHaveTextContent('ada.lovelace@example.com');
    expect(row).toHaveTextContent('Engineering');
    expect(row).toHaveTextContent('admin');
    expect(row).toHaveTextContent('active');
  });

  it('renders an empty state when there are no users', () => {
    render(<UserListView users={[]} />);

    expect(screen.getByText(/no users/i)).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Lovelace/ })).not.toBeInTheDocument();
  });
});
