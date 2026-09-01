// types/async-ui.ts
import { ReactElement } from 'react';

export interface TBaseSkeletonConfig {
    type: 'table' | 'grid' | 'list' | 'card' | 'custom';
    rows?: number;
    columns?: number;
    gridColumns?: number;
    gap?: number;
    showHeader?: boolean;
    showFooter?: boolean;
    showCheckboxes?: boolean;
    showPagination?: boolean;
    itemHeight?: string;
}

export interface TBaseAsyncWrapperConfig {
    loadingComponent: (children: ReactElement) => ReactElement;
    errorComponent: (error: Error, onRetry?: () => void) => ReactElement;
    refetchComponent: (children: ReactElement) => ReactElement;
    showOverlayOnRefetch?: boolean;
    onRetry?: () => void;
}
