// ========================================
// VALIDATION STATE
// ========================================
export type TValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

// ========================================
// EDIT MODE SLICE
// ========================================
export interface TBaseEditSlice {
  isEditing: boolean;
  enableEdit: () => void;
  disableEdit: () => void;
}

// ========================================
// DIRTY TRACKING SLICE
// ========================================
export interface TBaseDirtySlice {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
}

// ========================================
// VALIDATION STATE SLICE
// ========================================
export interface TBaseValidationSlice {
  validationState: TValidationState;
  setValidationState: (state: TValidationState) => void;
}

// ========================================
// DETAIL ERROR SLICE
// ========================================
export interface TBaseDetailErrorSlice {
  detailError: string | null;
  setDetailError: (error: string | null) => void;
  clearDetailError: () => void;
}

// ========================================
// UNSAVED WARNING SLICE
// ========================================
export interface TBaseUnsavedWarningSlice {
  showUnsavedWarning: boolean;
  setShowUnsavedWarning: (show: boolean) => void;
}

// ========================================
// RESET SLICE
// ========================================
interface TBaseDetailResetSlice {
  reset: () => void;
}

// ========================================
// COMBINED BASE DETAIL UI STORE
// ========================================
export interface TBaseDetailUIStore
  extends TBaseEditSlice,
    TBaseDirtySlice,
    TBaseValidationSlice,
    TBaseDetailErrorSlice,
    TBaseUnsavedWarningSlice,
    TBaseDetailResetSlice {}

// ========================================
// STORE HOOK TYPE
// ========================================
export type TBaseDetailStoreHook = <T>(
  selector: (state: TBaseDetailUIStore) => T
) => T;
