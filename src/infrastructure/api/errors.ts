import type { ZodError } from 'zod';

/**
 * ProviderError - Normalizes errors from all provider types
 * Used to provide consistent error handling across REST, TRPC, and Mock providers
 */
export class ProviderError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly data?: unknown;

  constructor(
    message: string,
    code: string,
    status?: number,
    data?: unknown
  ) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
    this.data = data;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ProviderError);
    }
  }
}

/**
 * ValidationError - For Zod validation failures at provider boundary
 * Flattens Zod errors into a simplified format for easier consumption
 */
export class ValidationError extends Error {
  public readonly errors: Array<{ path: (string | number)[]; message: string }>;

  constructor(message: string, zodErrors: ZodError) {
    super(message);
    this.name = 'ValidationError';
    this.errors = zodErrors.errors.map(e => ({
      path: e.path,
      message: e.message,
    }));

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ValidationError);
    }
  }
}
