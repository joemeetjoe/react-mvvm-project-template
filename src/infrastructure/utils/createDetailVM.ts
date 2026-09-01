// src/infrastructure/utils/createDetailVM.ts
/**
 * Creates a fully-featured detail view model with CRUD operations, form validation, and optimistic updates.
 *
 * @template TData - Entity data type from API
 * @template TFormData - Form data type (subset/transformation of TData)
 * @template TStore - Zustand detail store hook type
 * @template TService - Service with getById/update/delete methods
 *
 * @see {@link file://./docs/architecture/detail-vm-factory.md} - Detailed documentation
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { useFormValidation } from '@/infrastructure/hooks/useFormValidation';
import type { ZodSchema } from 'zod';
import type {
  TBaseDetailStoreHook,
  TBaseDetailUIStore
} from '@/infrastructure/types/data/stores.details.types';
import type { TBaseDetailService } from '@/infrastructure/types/api/detailService.types';
import type { TBaseDetailViewModel } from '@/infrastructure/types/vm/detail.types';

// ========================================
// GENERIC FACTORY CONFIGURATION TYPE
// ========================================
export type TDetailVMFactoryConfig<
  TData,
  TFormData,
  TStore extends TBaseDetailStoreHook,
  TService extends TBaseDetailService<TData>
> = {
  store: TStore;
  service: TService;
  queryKey: string;
  formConfig: {
    schema: ZodSchema<TFormData>;
    defaultValues: TFormData;
    toFormData: (data: TData) => TFormData;
  };
  mutationConfig?: {
    update?: boolean;
    delete?: boolean;
  };
  serviceMethods?: {
    getById?: string;
    update?: string;
    delete?: string;
  };
};

// ========================================
// 1. STORE STATE
// ========================================
function useStoreState<TStore extends TBaseDetailStoreHook>(store: TStore) {
  const isEditing = store(state => state.isEditing);
  const isDirty = store(state => state.isDirty);
  const validationState = store(state => state.validationState);
  const showUnsavedWarning = store(state => state.showUnsavedWarning);
  const detailError = store(state => state.detailError);

  return { isEditing, isDirty, validationState, showUnsavedWarning, detailError };
}

// ========================================
// 2. STORE ACTIONS
// ========================================
function useStoreActions<TStore extends TBaseDetailStoreHook>(store: TStore) {
  const enableEdit = store(state => state.enableEdit);
  const disableEdit = store(state => state.disableEdit);
  const setDirty = store(state => state.setDirty);
  const setValidationState = store(state => state.setValidationState);
  const setShowUnsavedWarning = store(state => state.setShowUnsavedWarning);
  const setDetailError = store(state => state.setDetailError);
  const clearDetailError = store(state => state.clearDetailError);
  const reset = store(state => state.reset);

  return {
    enableEdit,
    disableEdit,
    setDirty,
    setValidationState,
    setShowUnsavedWarning,
    setDetailError,
    clearDetailError,
    reset,
  };
}

// ========================================
// 3. DETAIL QUERY
// ========================================
function useDetailQuery<TData, TService extends TBaseDetailService<TData>>(
  service: TService,
  queryKey: string,
  id: string | undefined,
  serviceMethods: { getById: string; update: string; delete: string }
) {
  const svc = service as any;
  const query = useQuery({
    queryKey: [queryKey, 'detail', id],
    queryFn: () => {
      if (!id) throw new Error('ID is required');
      return svc[serviceMethods.getById](id);
    },
    enabled: !!id,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ========================================
// 4. DETAIL FORM
// ========================================
function useDetailForm<TData, TFormData extends Record<string, any>>(
  config: TDetailVMFactoryConfig<TData, TFormData, any, any>,
  initialData: TData | undefined,
  onDirtyChange: (isDirty: boolean) => void
) {
  // Determine default values: use transformed data if available, else defaults
  const formDefaults = initialData
    ? config.formConfig.toFormData(initialData)
    : config.formConfig.defaultValues;

  const formValidation = useFormValidation<TFormData>({
    schema: config.formConfig.schema,
    defaultValues: formDefaults,
    onSubmit: async (data) => {
      // onSubmit handler will be wired in handlers section
      // This is just for form validation - actual mutation happens in handlers
    },
    onDirtyChange,
  });

  // Watch for data changes and update form defaults when query resolves
  useEffect(() => {
    if (initialData) {
      const newFormData = config.formConfig.toFormData(initialData);
      formValidation.resetForm(newFormData);
    }
  }, [initialData]);

  return formValidation;
}

// ========================================
// 5. DETAIL MUTATIONS
// ========================================
/**
 * Detail mutations with optimistic update support for update operations.
 *
 * UPDATE MUTATIONS follow TanStack Query's optimistic update pattern:
 *   Step 1: Cancel outgoing queries (prevent stale refetch overwriting optimistic data)
 *   Step 2: Snapshot previous state (enables rollback on error)
 *   Step 3: Optimistically update cache (user sees immediate feedback)
 *   Step 4: Rollback on error (restore snapshot if server rejects)
 *   Step 5: Refetch on settlement (sync with server truth, handles transforms)
 *
 * DELETE MUTATIONS do NOT use optimistic updates:
 *   Architectural decision: destructive operations wait for server confirmation.
 *   Rationale: false positive on delete (item disappears then reappears) is worse UX
 *   than a brief loading state.
 *
 * @see .planning/phases/06-optimistic-updates-framework/OPTIMISTIC-UPDATES-GUIDE.md for decision tree and developer documentation
 */
function useDetailMutations<TData>(
  service: TBaseDetailService<TData>,
  queryKey: string,
  id: string | undefined,
  serviceMethods: { getById: string; update: string; delete: string },
  mutationConfig: { update: boolean; delete: boolean }
) {
  const queryClient = useQueryClient();

  // Update mutation with optimistic update + rollback
  const updateMutation = useMutation({
    mutationFn: (data: Partial<TData>) => {
      if (!id) throw new Error('ID is required for update');
      return service[serviceMethods.update](id, data);
    },
    onMutate: async (newData) => {
      if (!id) return { previousData: undefined };

      // Step 1: Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: [queryKey, 'detail', id] });

      // Step 2: Snapshot previous state for rollback
      const previousData = queryClient.getQueryData<TData>([queryKey, 'detail', id]);

      // Step 3: Optimistically update cache (immediate UI feedback)
      queryClient.setQueryData<TData>([queryKey, 'detail', id], (old) => {
        return old ? { ...old, ...newData } : old;
      });

      // Step 4 context: Return snapshot for onError rollback
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Step 4: Rollback - restore previous state from snapshot
      if (context?.previousData && id) {
        queryClient.setQueryData([queryKey, 'detail', id], context.previousData);
      }
    },
    onSettled: () => {
      // Step 5: Refetch on settlement - sync with server truth
      // Always invalidate both detail and list queries to prevent stale caches
      if (id) {
        queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', id] });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey, 'list'] });
    },
  }) as UseMutationResult<TData, Error, Partial<TData>>;

  // DELETE: No optimistic update (architectural decision - destructive ops wait for server)
  // See OPTIMISTIC-UPDATES-GUIDE.md for rationale
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('ID is required for delete');
      return service[serviceMethods.delete](id) as Promise<void>;
    },
    onSuccess: () => {
      // Invalidate both detail and list queries to prevent stale caches
      if (id) {
        queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', id] });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey, 'list'] });
    },
  }) as UseMutationResult<void, Error, void>;

  return {
    update: mutationConfig.update ? updateMutation : undefined,
    delete: mutationConfig.delete ? deleteMutation : undefined,
    isUpdating: mutationConfig.update ? updateMutation.isPending : false,
    isDeleting: mutationConfig.delete ? deleteMutation.isPending : false,
  };
}

// ========================================
// 6. DERIVED STATE
// ========================================
function useDerivedDetailState(
  query: { isLoading: boolean },
  form: { isValid: boolean },
  store: ReturnType<typeof useStoreState>,
  mutations: ReturnType<typeof useDetailMutations>
) {
  const isLoading = query.isLoading || mutations.isUpdating || mutations.isDeleting;
  const hasUnsavedChanges = store.isDirty && store.isEditing;
  const canSave = store.isEditing && store.isDirty && form.isValid && !mutations.isUpdating;
  const canDelete = !store.isEditing && !mutations.isDeleting;

  return {
    isLoading,
    hasUnsavedChanges,
    canSave,
    canDelete,
  };
}

// ========================================
// 7. HANDLERS
// ========================================
function useDetailHandlers<TFormData extends Record<string, any>>(
  form: ReturnType<typeof useFormValidation<TFormData>>,
  mutations: ReturnType<typeof useDetailMutations>,
  storeActions: ReturnType<typeof useStoreActions>,
  refetch: () => void
) {
  const handleEnableEdit = useCallback(() => {
    storeActions.enableEdit();
  }, [storeActions]);

  const handleSave = useCallback(async () => {
    try {
      // Submit form (triggers validation)
      await form.form.handleSubmit();

      // If form is valid, get the values and call update mutation
      if (form.isValid && mutations.update) {
        const formData = form.form.state.values;
        await mutations.update.mutateAsync(formData as any);

        // On success: clear dirty state and disable edit
        storeActions.setDirty(false);
        storeActions.disableEdit();
        storeActions.clearDetailError();
      }
    } catch (error) {
      // On failure: set error
      storeActions.setDetailError(error instanceof Error ? error.message : 'Save failed');
    }
  }, [form, mutations, storeActions]);

  const handleCancel = useCallback(() => {
    // Reset form to last saved values
    form.resetForm();
    storeActions.setDirty(false);
    storeActions.disableEdit();
    storeActions.clearDetailError();
  }, [form, storeActions]);

  const handleDelete = useCallback(async () => {
    if (!mutations.delete) return;

    try {
      await mutations.delete.mutateAsync();
    } catch (error) {
      storeActions.setDetailError(error instanceof Error ? error.message : 'Delete failed');
    }
  }, [mutations, storeActions]);

  const handleDiscardChanges = useCallback(() => {
    form.resetForm();
    storeActions.setDirty(false);
    storeActions.setShowUnsavedWarning(false);
  }, [form, storeActions]);

  return {
    handleEnableEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleDiscardChanges,
  };
}

// ========================================
// 8. FACTORY FUNCTION
// ========================================
export function createDetailVM<
  TData,
  TFormData extends Record<string, any>,
  TStore extends TBaseDetailStoreHook,
  TService extends TBaseDetailService<TData>
>(
  config: TDetailVMFactoryConfig<TData, TFormData, TStore, TService>
) {
  return function useDetailVM(id: string | undefined): TBaseDetailViewModel<TData> {
    // Default service methods
    const serviceMethods = {
      getById: config.serviceMethods?.getById || 'getById',
      update: config.serviceMethods?.update || 'update',
      delete: config.serviceMethods?.delete || 'delete',
    };

    // Default mutation config
    const mutationConfig = {
      update: config.mutationConfig?.update !== false,
      delete: config.mutationConfig?.delete !== false,
    };

    // Compose all hooks
    const storeState = useStoreState(config.store);
    const storeActions = useStoreActions(config.store);

    const query = useDetailQuery<TData, TService>(
      config.service,
      config.queryKey,
      id,
      serviceMethods
    );

    const form = useDetailForm<TData, TFormData>(
      config,
      query.data,
      storeActions.setDirty
    );

    const mutations = useDetailMutations<TData>(
      config.service,
      config.queryKey,
      id,
      serviceMethods,
      mutationConfig
    );

    const computed = useDerivedDetailState(query, form, storeState, mutations);

    const handlers = useDetailHandlers<TFormData>(
      form,
      mutations,
      storeActions,
      query.refetch
    );

    // Return composed view model matching TBaseDetailViewModel interface
    return {
      query: {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
      },
      form: {
        isDirty: form.isDirty,
        isValid: form.isValid,
        errors: form.fieldErrors,
        submit: handlers.handleSave,
        reset: form.resetForm,
      },
      state: {
        isEditing: storeState.isEditing,
        isDirty: storeState.isDirty,
        validationState: storeState.validationState,
        showUnsavedWarning: storeState.showUnsavedWarning,
        detailError: storeState.detailError,
      },
      mutations: {
        update: mutations.update!,
        delete: mutations.delete!,
        isUpdating: mutations.isUpdating,
        isDeleting: mutations.isDeleting,
      },
      computed: {
        isLoading: computed.isLoading,
        hasUnsavedChanges: computed.hasUnsavedChanges,
        canSave: computed.canSave,
        canDelete: computed.canDelete,
      },
      actions: {
        edit: handlers.handleEnableEdit,
        save: handlers.handleSave,
        cancel: handlers.handleCancel,
        delete: handlers.handleDelete,
        discardChanges: handlers.handleDiscardChanges,
      },
    };
  };
}
