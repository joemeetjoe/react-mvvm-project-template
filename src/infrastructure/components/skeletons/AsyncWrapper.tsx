// components/async-wrapper.tsx
import { ReactElement } from 'react';
import { useVM } from '../context/vmContext';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';

interface AsyncWrapperProps {
    children: ReactElement;
}

export const AsyncWrapper = ({ children }: AsyncWrapperProps) => {
    const vm = useVM<TBaseListViewModel>();

    const isInitialLoad = vm.computed.isEmpty && vm.query.isLoading;
    const isRefetching = !vm.computed.isEmpty && vm.query.isLoading;

    const asyncConfig = vm.config.async;
    if (!asyncConfig) return children;

    const {
        loadingComponent,
        errorComponent,
        refetchComponent,
        showOverlayOnRefetch = true,
        onRetry
    } = asyncConfig;

    // Initial load
    if (isInitialLoad) {
        return loadingComponent(children);
    }

    // Error state
    if (vm.query.error) {
        return errorComponent(vm.query.error, onRetry);
    }

    // Refetching state
    if (isRefetching && showOverlayOnRefetch) {
        return refetchComponent(children);
    }

    // Loaded state
    return children;
};
