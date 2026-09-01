// Service interface for list data fetching
export interface IBaseListService<TData = unknown> {
    [key: string]: (...args: any[]) => Promise<any>;
}

// Service interface for filter options fetching
export interface IBaseListFilterService {
    [key: string]: (...args: any[]) => Promise<any>;
}

// Combined service type - uses any to allow classes without index signatures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TBaseListService<TData = unknown> = any;
