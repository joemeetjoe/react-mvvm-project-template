// src/templates/common/types.ts

export interface TBaseViewModel {
  isLoading: boolean;
  error: Error | null;
  isInitialLoad?: boolean;
}
