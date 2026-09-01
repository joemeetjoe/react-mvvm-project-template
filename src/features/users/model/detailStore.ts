import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DevtoolsOptions } from 'zustand/middleware';
import type { TBaseDetailUIStore } from '@/infrastructure/types/data/stores.details.types';

// ========================================
// USERS DETAIL STORE TYPE
// ========================================
export type TUserDetailStore = TBaseDetailUIStore;

// ========================================
// INITIAL STATE
// ========================================
const initialState = {
  isEditing: false,
  isDirty: false,
  validationState: 'idle' as const,
  detailError: null,
  showUnsavedWarning: false,
};

// ========================================
// USERS DETAIL STORE
// ========================================
export const useUserDetailStore = create<TUserDetailStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Edit mode
      enableEdit: () => set({ isEditing: true }, false, 'enableEdit'),
      disableEdit: () => set({ isEditing: false, isDirty: false }, false, 'disableEdit'),

      // Dirty tracking
      setDirty: (dirty: boolean) => set({ isDirty: dirty }, false, 'setDirty'),

      // Validation
      setValidationState: (validationState) => set({ validationState }, false, 'setValidationState'),

      // Detail error
      setDetailError: (error) => set({ detailError: error }, false, 'setDetailError'),
      clearDetailError: () => set({ detailError: null }, false, 'clearDetailError'),

      // Unsaved warning
      setShowUnsavedWarning: (show) => set({ showUnsavedWarning: show }, false, 'setShowUnsavedWarning'),

      // Reset
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'UserDetailStore', enabled: import.meta.env.DEV } as DevtoolsOptions
  )
);
