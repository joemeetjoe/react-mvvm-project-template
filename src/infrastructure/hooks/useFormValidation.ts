import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import type { ZodSchema, ZodError } from 'zod';
import type { ReactFormExtendedApi } from '@tanstack/react-form';

// Configuration for the validation hook
export interface UseFormValidationConfig<TFormData> {
  /** Zod schema for validation */
  schema: ZodSchema<TFormData>;
  /** Default form values */
  defaultValues: TFormData;
  /** Called on successful form submission with validated data */
  onSubmit: (data: TFormData) => Promise<void>;
  /** Called when dirty state changes (for store sync) */
  onDirtyChange?: (isDirty: boolean) => void;
}

// Result returned by the hook
export interface UseFormValidationResult<TFormData> {
  /** TanStack Form API instance */
  form: ReactFormExtendedApi<TFormData, any, any, any, any, any, any, any, any, any, any, any>;
  /** Whether the form has been modified from defaults */
  isDirty: boolean;
  /** Whether all fields pass validation */
  isValid: boolean;
  /** Flattened field errors from last validation */
  fieldErrors: Record<string, string[]>;
  /** Form-level error message (if any) */
  formError: string | null;
  /** Validate all fields without submitting */
  validate: () => { success: boolean; errors: Record<string, string[]> };
  /** Reset form to default values or new values */
  resetForm: (newDefaults?: TFormData) => void;
}

/**
 * Hook that integrates Zod validation with TanStack Form.
 *
 * Validation uses safeParse (never throws exceptions).
 * Field errors are surfaced as state, not thrown.
 * Dirty state changes are reported via onDirtyChange callback for store sync.
 *
 * CRITICAL: This hook manages FORM state (field values, field errors).
 * It does NOT manage UI state (isEditing, showUnsavedWarning) - that's the store's job.
 * The onDirtyChange callback is the ONLY bridge between form and store.
 */
export function useFormValidation<TFormData extends Record<string, any>>(
  config: UseFormValidationConfig<TFormData>
): UseFormValidationResult<TFormData> {
  const { schema, defaultValues, onSubmit, onDirtyChange } = config;

  // Track validation state (using ref to avoid re-render loops)
  const fieldErrorsRef = useRef<Record<string, string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Create TanStack Form instance with Zod validation
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // Validate with Zod using safeParse (never throws)
      const result = schema.safeParse(value);

      if (!result.success) {
        // Validation failed - extract field errors
        const zodError = result.error as ZodError<TFormData>;
        const flattened = zodError.flatten();

        // Convert Zod's field errors to Record<string, string[]>
        const errors: Record<string, string[]> = {};
        Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
          const msgs = messages as string[] | undefined;
          if (msgs && msgs.length > 0) {
            errors[field] = msgs;
          }
        });

        fieldErrorsRef.current = errors;
        setFieldErrors(errors);
        setFormError('Please fix the validation errors before submitting.');
        setIsValid(false);
        return;
      }

      // Validation passed - clear errors and submit
      fieldErrorsRef.current = {};
      setFieldErrors({});
      setFormError(null);
      setIsValid(true);

      try {
        await onSubmit(result.data);
      } catch (error) {
        // Handle submission errors (e.g., API errors)
        setFormError(error instanceof Error ? error.message : 'An error occurred during submission');
      }
    },
  });

  // Track dirty state (compare current values to defaults)
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const currentValues = form.state.values;
    const currentIsDirty = JSON.stringify(currentValues) !== JSON.stringify(defaultValues);

    if (currentIsDirty !== isDirty) {
      setIsDirty(currentIsDirty);
      onDirtyChange?.(currentIsDirty);
    }
  }, [form.state.values, defaultValues, isDirty, onDirtyChange]);

  // Validate function (for external callers - validates without submitting)
  const validate = useCallback(() => {
    const result = schema.safeParse(form.state.values);

    if (!result.success) {
      const zodError = result.error as ZodError<TFormData>;
      const flattened = zodError.flatten();

      const errors: Record<string, string[]> = {};
      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        const msgs = messages as string[] | undefined;
        if (msgs && msgs.length > 0) {
          errors[field] = msgs;
        }
      });

      fieldErrorsRef.current = errors;
      setFieldErrors(errors);
      setIsValid(false);
      return { success: false, errors };
    }

    fieldErrorsRef.current = {};
    setFieldErrors({});
    setIsValid(true);
    return { success: true, errors: {} };
  }, [schema, form.state.values]);

  // Reset function (reset to defaults or new values)
  const resetForm = useCallback((newDefaults?: TFormData) => {
    const resetValues = newDefaults ?? defaultValues;
    form.reset();

    // If new defaults provided, update form values
    if (newDefaults) {
      Object.entries(newDefaults).forEach(([key, value]) => {
        const field = form.getFieldValue(key as any);
        if (field !== undefined) {
          form.setFieldValue(key as any, value as any);
        }
      });
    }

    // Clear errors
    fieldErrorsRef.current = {};
    setFieldErrors({});
    setFormError(null);
    setIsValid(true);

    // Reset dirty state
    setIsDirty(false);
    onDirtyChange?.(false);
  }, [defaultValues, form, onDirtyChange]);

  return {
    form,
    isDirty,
    isValid,
    fieldErrors,
    formError,
    validate,
    resetForm,
  };
}
