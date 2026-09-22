import type { ColumnDef } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { DataTable } from './DataTable';

type Row = { id: string; name: string };

const columns: ColumnDef<Row, string>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'id', accessorKey: 'id', header: 'ID', enableSorting: false },
];

const data: Row[] = [
  { id: 'A', name: 'Ada' },
  { id: 'B', name: 'Grace' },
];

const baseProps = {
  columns,
  data,
  sorting: [{ id: 'name', desc: false }],
  pagination: { pageIndex: 0, pageSize: 10 },
  pageCount: 2,
  pageSizeOptions: [10, 20, 50],
};

describe('DataTable', () => {
  it('renders a row for each item and a header for each column', () => {
    const onSortingChange = vi.fn();
    const onPaginationChange = vi.fn();

    render(
      <DataTable
        {...baseProps}
        onSortingChange={onSortingChange}
        onPaginationChange={onPaginationChange}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Ada/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Grace/ })).toBeInTheDocument();
  });

  it('shows the empty message when there is no data', () => {
    render(
      <DataTable
        {...baseProps}
        data={[]}
        onSortingChange={vi.fn()}
        onPaginationChange={vi.fn()}
        emptyMessage="Nothing here."
      />,
    );

    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('calls onSortingChange with the next sorting state when a sortable header is clicked', async () => {
    const onSortingChange = vi.fn();

    const { user } = render(
      <DataTable {...baseProps} onSortingChange={onSortingChange} onPaginationChange={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortingChange).toHaveBeenCalledTimes(1);
    const updater = onSortingChange.mock.calls[0]?.[0];
    const next = typeof updater === 'function' ? updater(baseProps.sorting) : updater;

    expect(next).toEqual([{ id: 'name', desc: true }]);
  });

  it('does not render a sort button for a column with sorting disabled', () => {
    render(<DataTable {...baseProps} onSortingChange={vi.fn()} onPaginationChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'ID' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
  });

  it('calls onPaginationChange with the previous page index when Previous is clicked', async () => {
    const onPaginationChange = vi.fn();

    const { user } = render(
      <DataTable
        {...baseProps}
        pagination={{ pageIndex: 1, pageSize: 10 }}
        onSortingChange={vi.fn()}
        onPaginationChange={onPaginationChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    const updater = onPaginationChange.mock.calls[0]?.[0];
    const next = typeof updater === 'function' ? updater({ pageIndex: 1, pageSize: 10 }) : updater;

    expect(next).toEqual({ pageIndex: 0, pageSize: 10 });
  });

  it('calls onPaginationChange with the next page index when Next is clicked', async () => {
    const onPaginationChange = vi.fn();

    const { user } = render(
      <DataTable {...baseProps} onSortingChange={vi.fn()} onPaginationChange={onPaginationChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));

    const updater = onPaginationChange.mock.calls[0]?.[0];
    const next = typeof updater === 'function' ? updater({ pageIndex: 0, pageSize: 10 }) : updater;

    expect(next).toEqual({ pageIndex: 1, pageSize: 10 });
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(
      <DataTable
        {...baseProps}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        pageCount={1}
        onSortingChange={vi.fn()}
        onPaginationChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls onPaginationChange with a reset page index when the page size changes', async () => {
    const onPaginationChange = vi.fn();

    const { user } = render(
      <DataTable
        {...baseProps}
        pagination={{ pageIndex: 1, pageSize: 10 }}
        onSortingChange={vi.fn()}
        onPaginationChange={onPaginationChange}
      />,
    );

    await user.click(screen.getByLabelText('Rows per page'));
    await user.click(await screen.findByRole('option', { name: '20' }));

    const updater = onPaginationChange.mock.calls[0]?.[0];
    const next = typeof updater === 'function' ? updater({ pageIndex: 1, pageSize: 10 }) : updater;

    expect(next).toEqual({ pageIndex: 0, pageSize: 20 });
  });

  it('marks the table busy while fetching', () => {
    const { container } = render(
      <DataTable {...baseProps} isFetching onSortingChange={vi.fn()} onPaginationChange={vi.fn()} />,
    );

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });
});
