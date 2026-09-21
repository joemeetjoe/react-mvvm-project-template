import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import type { UserFilterOptions } from '../../data-layer/entities/user/userSchema';
import { UserListView } from './UserListView';
import type { UserListViewProps } from './UserListView';
import { emptyUserFilterFormValues, useUserFilterForm } from './useUserFilterForm';
import type { UserFilterFormValues } from './useUserFilterForm';

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

const filterOptions: UserFilterOptions = {
  roles: ['admin', 'user'],
  statuses: ['active', 'inactive'],
  departments: ['Engineering', 'Research'],
};

// `form` is a real TanStack Form instance (typed via the colocated form
// hook, decision 8) rather than a hand-rolled stub, so this harness renders
// it the only way it can be created: inside a component.
type HarnessProps = Omit<UserListViewProps, 'form'> & {
  defaultValues?: UserFilterFormValues;
  onFilterSubmit?: (values: UserFilterFormValues) => void;
};

const UserListViewHarness = ({
  defaultValues = emptyUserFilterFormValues,
  onFilterSubmit = vi.fn(),
  ...rest
}: HarnessProps): ReactElement => {
  const form = useUserFilterForm(defaultValues, onFilterSubmit);

  return <UserListView {...rest} form={form} />;
};

const props: HarnessProps = {
  users: [baseUser],
  total: 1,
  sort: { field: 'firstName', direction: 'asc' },
  page: 1,
  pageSize: 10,
  isFetching: false,
  onSortChange: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
  filterOptions,
  hasActiveFilters: false,
  onClearFilters: vi.fn(),
};

describe('UserListView', () => {
  it('renders a row for each user', () => {
    render(<UserListViewHarness {...props} />);

    const row = screen.getByRole('row', { name: /Ada Lovelace/ });

    expect(row).toHaveTextContent('ada.lovelace@example.com');
    expect(row).toHaveTextContent('Engineering');
    expect(row).toHaveTextContent('admin');
    expect(row).toHaveTextContent('active');
  });

  it('renders an empty state when there are no users', () => {
    render(<UserListViewHarness {...props} users={[]} total={0} />);

    expect(screen.getByText(/no users/i)).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Lovelace/ })).not.toBeInTheDocument();
  });

  it('calls onSortChange with the toggled direction when a column header is clicked', async () => {
    const onSortChange = vi.fn();

    const { user } = render(<UserListViewHarness {...props} onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith({ field: 'firstName', direction: 'desc' });
  });

  it('toggles back to ascending when the already-descending column header is clicked', async () => {
    const onSortChange = vi.fn();

    const { user } = render(
      <UserListViewHarness
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
      <UserListViewHarness {...props} total={25} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageSizeChange when the page size is changed', async () => {
    const onPageSizeChange = vi.fn();

    const { user } = render(
      <UserListViewHarness {...props} onPageSizeChange={onPageSizeChange} />,
    );

    await user.selectOptions(screen.getByLabelText('Rows per page'), '20');

    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders the filter form pre-filled from the given default values', () => {
    render(
      <UserListViewHarness
        {...props}
        defaultValues={{ search: 'ada', role: 'admin', status: '', department: '' }}
      />,
    );

    expect(screen.getByLabelText('Search')).toHaveValue('ada');
    expect(screen.getByLabelText('Role')).toHaveValue('admin');
  });

  it('submits the current filter values when Apply filters is clicked', async () => {
    const onFilterSubmit = vi.fn();

    const { user } = render(
      <UserListViewHarness {...props} onFilterSubmit={onFilterSubmit} />,
    );

    await user.type(screen.getByLabelText('Search'), 'ada');
    await user.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(onFilterSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'ada' }),
    );
  });

  it('calls onClearFilters when Clear filters is clicked', async () => {
    const onClearFilters = vi.fn();

    const { user } = render(
      <UserListViewHarness {...props} hasActiveFilters onClearFilters={onClearFilters} />,
    );

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('disables the filter submit button while the list is fetching', () => {
    render(<UserListViewHarness {...props} isFetching />);

    expect(screen.getByRole('button', { name: /apply filters/i })).toBeDisabled();
  });
});
