import type { ReactNode } from 'react';

export interface FormErrorProps {
  /** Error message to display */
  message?: string | null;
  /** Optional title (defaults to "Error") */
  title?: string;
  /** Optional CSS class override */
  className?: string;
}

/**
 * Displays form-level error as a banner at the top of a form.
 * Renders nothing if no message present.
 */
export function FormError({ message, title = 'Error', className }: FormErrorProps): ReactNode {
  if (!message) {
    return null;
  }

  return (
    <div
      className={className ?? 'rounded-md border border-destructive/50 bg-destructive/10 p-4'}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-destructive">
            {title}
          </h4>
          <p className="mt-1 text-sm text-destructive/90">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
