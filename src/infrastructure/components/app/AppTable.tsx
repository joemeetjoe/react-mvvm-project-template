import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  PaginationState,
  RowSelectionState,
  Row
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Checkbox } from '@/shared/ui/checkbox';

export interface AppTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  enablePagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowClick?: (row: TData) => void;
  detailsPath?: string;
  zebraStripes?: boolean;
  className?: string;
}

export function AppTable<TData>({
  data,
  columns,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enablePagination = true,
  pagination: controlledPagination,
  onPaginationChange,
  onRowClick,
  detailsPath,
  zebraStripes = true,
  className,
}: AppTableProps<TData>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const pagination = controlledPagination ?? internalPagination;

  const setRowSelection = (updater: any) => {
    const newValue = typeof updater === 'function' ? updater(rowSelection) : updater;
    onRowSelectionChange?.(newValue);
    if (!controlledRowSelection) setInternalRowSelection(newValue);
  };

  const setPagination = (updater: any) => {
    const newValue = typeof updater === 'function' ? updater(pagination) : updater;
    onPaginationChange?.(newValue);
    if (!controlledPagination) setInternalPagination(newValue);
  };

  const tableColumns = React.useMemo(() => {
    const cols = [...columns];
    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData, any>);
    }
    return cols;
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      rowSelection,
      pagination: enablePagination ? pagination : undefined,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    manualPagination: !enablePagination,
  });

  const handleRowClick = (row: Row<TData>) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  };

  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row)}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={tableColumns.length}>No results found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function useAppTableState() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  return { rowSelection, setRowSelection, pagination, setPagination };
}
