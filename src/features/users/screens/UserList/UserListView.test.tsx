import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { UserListView } from './UserListView';
import type { UserListViewProps } from './UserListView';

const baseUser = {
  id: 'USR-001',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.lovelace@example.com',
  role: 'admin',
  status: 'active',
  department: 'Engineering',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-11-20T14:30:00Z',
} as const;

const props: UserListViewProps = {
  users: [baseUser],
  total: 1,
  sort: { field: 'firstName', direction: 'asc' },
  page: 1,
  pageSize: 10,
  isFetching: false,
  onSortChange: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
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
    render(<UserListView {...props} users={[]} total={0} />);

    expect(screen.getByText(/no users/i)).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Lovelace/ })).not.toBeInTheDocument();
  });

  it('calls onSortChange with the toggled direction when a column header is clicked', async () => {
    const onSortChange = vi.fn();

    const { user } = render(<UserListView {...props} onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith({ field: 'firstName', direction: 'desc' });
  });

  it('toggles back to ascending when the already-descending column header is clicked', async () => {
    const onSortChange = vi.fn();

    const { user } = render(
      <UserListView
        {...props}
        sort={{ field: 'firstName', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith({ field: 'firstName', direction: 'asc' });
  });

  it('calls onPageChange when the next page button is clicked', async () => {
    const onPageChange = vi.fn();

    const { user } = render(
      <UserListView {...props} total={25} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageSizeChange when the page size is changed', async () => {
    const onPageSizeChange = vi.fn();

    const { user } = render(
      <UserListView {...props} onPageSizeChange={onPageSizeChange} />,
    );

    await user.selectOptions(screen.getByLabelText('Rows per page'), '20');

    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
