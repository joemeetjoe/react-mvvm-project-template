import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';

type GridVariant = 'standard' | 'masonry' | 'split' | 'dashboard';

type Breakpoints = {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
};

interface GridLayoutProps {
    children: ReactNode;
    variant?: GridVariant;
    columns?: number | Breakpoints;
    rows?: number | string;
    gap?: number | { column?: number; row?: number };
    gapUnit?: number;
    height?: string | number;
    scrollable?: boolean | 'horizontal' | 'vertical';
    areas?: string[];
    className?: string;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

    useEffect(() => {
        const breakpoints = {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
        };

        const handleResize = debounce(() => {
            const width = window.innerWidth;
            if (width >= breakpoints.xl) setBreakpoint('xl');
            else if (width >= breakpoints.lg) setBreakpoint('lg');
            else if (width >= breakpoints.md) setBreakpoint('md');
            else if (width >= breakpoints.sm) setBreakpoint('sm');
            else setBreakpoint('xs');
        }, 150);

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakpoint;
};

export const GridLayout: React.FC<GridLayoutProps> = ({
    children,
    variant = 'standard',
    columns = 3,
    rows,
    gap = 4,
    gapUnit = 0.25,
    height,
    scrollable = false,
    areas,
    className = '',
    alignItems,
    justifyItems,
}) => {
    const currentBreakpoint = useBreakpoint();

    const getGridColumns = (): string => {
        if (typeof columns === 'object' && columns !== null) {
            const { xl = 5, lg = 4, md = 3, sm = 2, xs = 1 } = columns;
            const columnCount = { xl, lg, md, sm, xs }[currentBreakpoint];
            return `repeat(${columnCount}, 1fr)`;
        }
        return `repeat(${columns}, 1fr)`;
    };

    const getGap = (): string => {
        if (typeof gap === 'object' && gap !== null) {
            const rowGap = gap.row ?? 4;
            const colGap = gap.column ?? 4;
            return `${rowGap * gapUnit}rem ${colGap * gapUnit}rem`;
        }
        return `${gap * gapUnit}rem`;
    };

    const getVariantStyles = (): CSSProperties => {
        const baseStyles: CSSProperties = {
            display: 'grid',
            gap: getGap(),
            alignItems,
            justifyItems,
        };

        switch (variant) {
            case 'masonry':
                return { ...baseStyles, gridTemplateColumns: getGridColumns(), gridAutoRows: 'auto' };
            case 'split':
                return { ...baseStyles, gridTemplateColumns: '1fr 2fr', height: height || '100vh' };
            case 'dashboard':
                return { ...baseStyles, gridTemplateColumns: getGridColumns(), gridAutoRows: rows || 'minmax(200px, auto)' };
            default:
                return {
                    ...baseStyles,
                    gridTemplateColumns: getGridColumns(),
                    gridTemplateRows: rows,
                    gridTemplateAreas: areas?.map(area => `"${area}"`).join(' '),
                };
        }
    };

    const getScrollableStyles = (): CSSProperties => {
        if (!scrollable) return {};
        const scrollDirection = scrollable === true ? 'vertical' : scrollable;
        return {
            overflowY: scrollDirection === 'vertical' ? 'auto' : 'hidden',
            overflowX: scrollDirection === 'horizontal' ? 'auto' : 'hidden',
            height: height || (scrollDirection === 'vertical' ? '100vh' : '100%'),
        };
    };

    return (
        <div className={`grid-layout ${className}`} style={{ ...getVariantStyles(), ...getScrollableStyles() }}>
            {children}
        </div>
    );
};

interface GridItemProps {
    children: ReactNode;
    colSpan?: number;
    rowSpan?: number;
    colStart?: number;
    rowStart?: number;
    colEnd?: number;
    rowEnd?: number;
    area?: string;
    className?: string;
}

export const GridItem: React.FC<GridItemProps> = ({
    children, colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd, area, className = '',
}) => {
    const getGridColumn = (): string | undefined => {
        if (area) return undefined;
        if (colStart && colEnd) return `${colStart} / ${colEnd}`;
        if (colStart && colSpan) return `${colStart} / span ${colSpan}`;
        if (colSpan) return `span ${colSpan}`;
        if (colStart) return `${colStart}`;
        return undefined;
    };

    const getGridRow = (): string | undefined => {
        if (area) return undefined;
        if (rowStart && rowEnd) return `${rowStart} / ${rowEnd}`;
        if (rowStart && rowSpan) return `${rowStart} / span ${rowSpan}`;
        if (rowSpan) return `span ${rowSpan}`;
        if (rowStart) return `${rowStart}`;
        return undefined;
    };

    return (
        <div className={`grid-item ${className}`} style={{ gridColumn: getGridColumn(), gridRow: getGridRow(), gridArea: area }}>
            {children}
        </div>
    );
};

export { useBreakpoint };
