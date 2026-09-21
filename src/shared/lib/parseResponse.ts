import type { ZodType } from 'zod';

/**
 * Raised when a response is well-formed JSON but not the shape the schema
 * expects. The route error component renders `message`, so it stays readable —
 * and, unlike a raw `ZodError`, it survives being logged.
 */
export class ResponseParseError extends Error {
  readonly issues: string;

  constructor(resource: string, issues: string) {
    super(`The ${resource} response did not match the expected shape (${issues})`);
    this.name = 'ResponseParseError';
    this.issues = issues;
  }
}

export const parseResponse = <TParsed>(
  schema: ZodType<TParsed>,
  resource: string,
  payload: unknown,
): TParsed => {
  const result = schema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new ResponseParseError(resource, issues);
};
