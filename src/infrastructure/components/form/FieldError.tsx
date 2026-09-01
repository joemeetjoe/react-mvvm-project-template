import type { ReactNode } from 'react';

export interface FieldErrorProps {
  /** Array of error messages for this field */
  errors?: string[];
  /** Optional CSS class override */
  className?: string;
}

/**
 * Displays field-level validation errors inline below a form field.
 * Renders nothing if no errors present.
 */
export function FieldError({ errors, className }: FieldErrorProps): ReactNode {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'space-y-1'} role="alert" aria-live="polite">
      {errors.map((error, index) => (
        <p
          key={index}
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ))}
    </div>
  );
}
