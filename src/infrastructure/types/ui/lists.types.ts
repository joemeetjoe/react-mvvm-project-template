import {
    ColumnDef
} from '@tanstack/react-table';

export type { ColumnDef };

export type TBaseColumnConfig<TData = any> = ColumnDef<TData>[];
