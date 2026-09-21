import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import type { ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, string>[];
  data: TData[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  pageSizeOptions: readonly number[];
  isFetching?: boolean;
  emptyMessage?: string;
};

/**
 * A fully controlled table: sorting and pagination state, and their change
 * handlers, arrive as props (decision 4 / issue #5). It keeps no competing
 * internal state of its own — `useReactTable` here is headless rendering
 * machinery driven entirely by those props (decision 7's allowed exception).
 */
export const DataTable = <TData,>({
  columns,
  data,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  pageCount,
  pageSizeOptions,
  isFetching = false,
  emptyMessage = 'No results.',
}: DataTableProps<TData>): ReactElement => {
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange,
    onPaginationChange,
    pageCount,
    manualSorting: true,
    manualPagination: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
  });

  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < pageCount - 1;

  return (
    <div className="space-y-4" aria-busy={isFetching}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();

                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>{emptyMessage}</TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="data-table-page-size" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <select
            id="data-table-page-size"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={pagination.pageSize}
            onChange={(event) => {
              const pageSize = Number(event.target.value);

              onPaginationChange((old) => ({ ...old, pageIndex: 0, pageSize }));
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {Math.max(pageCount, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex - 1 }))}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
