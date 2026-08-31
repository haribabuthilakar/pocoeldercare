import type { ZodError } from 'zod';

export interface FormattedFieldError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details: FormattedFieldError[];
}

/**
 * Normalizes a ZodError into structured field-level error details per D-75.
 */
export function formatZodError(error: ZodError): FormattedFieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));
}
