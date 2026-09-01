// components/common/RefetchWrapper.tsx
import React, { ReactNode } from 'react';

interface RefetchOverlayProps {
    isRefetching: boolean;
    children: ReactNode;
}

export const RefetchWrapper: React.FC<RefetchOverlayProps> = ({
  isRefetching,
  children,
}) => {
    return (
        <div className="relative">
            {children}

            {isRefetching && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    );
};
