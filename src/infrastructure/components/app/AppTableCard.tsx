import React, { createContext, useContext, ReactNode } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from '@/infrastructure/components/ui/card';
import { Button } from '@/infrastructure/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/infrastructure/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppTable, AppTableProps } from './AppTable';
import { PaginationState, RowSelectionState } from '@tanstack/react-table';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';
import { useVM } from '../context/vmContext';

interface AppTableCardContextValue {
    rowSelection: RowSelectionState;
    setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
}

const AppTableCardContext = createContext<AppTableCardContextValue | null>(null);

const AppTableCard = ({ children }: { children: ReactNode }) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    return (
        <AppTableCardContext.Provider value={{ rowSelection, setRowSelection, pagination, setPagination }}>
            <Card>{children}</Card>
        </AppTableCardContext.Provider>
    );
};

interface HeaderProps {
    children?: ReactNode;
    title?: string;
    showOpenSelectedButton?: boolean;
    onOpenSelected?: (selectedCount: number) => void;
}

const Header = ({ children }: HeaderProps) => {
    const vm = useVM<TBaseListViewModel>();
    const selectedCount = vm.computed.selectedCount;
    const onOpenSelected = vm.actions.selection.openSelected;
    const title = vm.config.card.title;

    const handleClick = () => {
        onOpenSelected();
    };

    return (
        <CardHeader className="flex flex-row items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            {selectedCount > 0 && (
                <Button onClick={handleClick} disabled={selectedCount === 0}>
                    Open {selectedCount > 0 ? `All Selected (${selectedCount})` : 'All Selected'}
                </Button>
            )}
            {children}
        </CardHeader>
    );
};

type ContentProps<TData> = Omit<AppTableProps<TData>, 'rowSelection' | 'onRowSelectionChange' | 'pagination' | 'onPaginationChange'>;

const Content = <TData,>(props: ContentProps<TData>) => {
    const context = useContext(AppTableCardContext);
    if (!context) throw new Error('Content must be used within AppTableCard');

    const { rowSelection, setRowSelection, pagination, setPagination } = context;

    return (
        <CardContent>
            <AppTable
                {...props}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                pagination={pagination}
                onPaginationChange={setPagination}
            />
        </CardContent>
    );
};

interface FooterProps {
    children?: ReactNode;
    showPagination?: boolean;
    pageSizeOptions?: number[];
}

const Footer = ({
    children,
    showPagination = true,
    pageSizeOptions = [10, 20, 30, 40, 50]
}: FooterProps) => {
    const context = useContext(AppTableCardContext);
    if (!context) throw new Error('Footer must be used within AppTableCard');

    const { pagination, setPagination } = context;

    const handlePreviousPage = () => {
        setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }));
    };

    const handleNextPage = () => {
        setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    };

    const handlePageSizeChange = (value: string) => {
        setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }));
    };

    return (
        <CardFooter className="px-8 flex items-center justify-between">
            {showPagination && (
                <div className="flex items-center space-x-2">
                    <Button onClick={handlePreviousPage} disabled={pagination.pageIndex === 0}>
                        <ChevronLeft />
                    </Button>
                    <Button onClick={handleNextPage}>
                        <ChevronRight />
                    </Button>
                    <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-24 ml-4">
                            <SelectValue placeholder={String(pagination.pageSize)} />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map(size => (
                                <SelectItem key={size} value={String(size)}>
                                    {size} rows
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {children}
        </CardFooter>
    );
};

AppTableCard.Header = Header;
AppTableCard.Content = Content;
AppTableCard.Footer = Footer;

export { AppTableCard };
