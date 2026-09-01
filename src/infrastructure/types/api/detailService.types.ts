// ========================================
// SERVICE INTERFACES
// ========================================

// Service interface for detail data fetching (getById)
export interface IBaseDetailReadService<TData = unknown> {
  [key: string]: (...args: any[]) => Promise<any>;
}

// Service interface for detail mutations (update, delete)
export interface IBaseDetailWriteService<TData = unknown> {
  [key: string]: (...args: any[]) => Promise<any>;
}

// Combined service type - uses any to allow classes without index signatures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TBaseDetailService<TData = unknown> = any;
