import type { UseMutationResult } from '@tanstack/react-query';

// ========================================
// QUERY GROUP
// ========================================
export interface TBaseDetailViewModelQuery<TData = unknown> {
  data: TData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ========================================
// FORM GROUP
// ========================================
export interface TBaseDetailViewModelForm {
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  submit: () => Promise<void>;
  reset: () => void;
}

// ========================================
// STATE GROUP
// ========================================
export interface TBaseDetailViewModelState {
  isEditing: boolean;
  isDirty: boolean;
  validationState: 'idle' | 'validating' | 'valid' | 'invalid';
  showUnsavedWarning: boolean;
  detailError: string | null;
}

// ========================================
// MUTATIONS GROUP
// ========================================
export interface TBaseDetailViewModelMutations<TData = unknown> {
  update: UseMutationResult<TData, Error, Partial<TData>>;
  delete: UseMutationResult<void, Error, void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ========================================
// COMPUTED GROUP
// ========================================
export interface TBaseDetailViewModelComputed {
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  canSave: boolean;
  canDelete: boolean;
}

// ========================================
// ACTIONS GROUP
// ========================================
export interface TBaseDetailViewModelActions {
  edit: () => void;
  save: () => Promise<void>;
  cancel: () => void;
  delete: () => Promise<void>;
  discardChanges: () => void;
}

// ========================================
// MAIN DETAIL VM TYPE
// ========================================
export interface TBaseDetailViewModel<TData = unknown> {
  query: TBaseDetailViewModelQuery<TData>;
  form: TBaseDetailViewModelForm;
  state: TBaseDetailViewModelState;
  mutations: TBaseDetailViewModelMutations<TData>;
  computed: TBaseDetailViewModelComputed;
  actions: TBaseDetailViewModelActions;
}
