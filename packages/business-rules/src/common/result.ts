/**
 * Tagged union Result type for pure functional error handling.
 * Eliminates thrown exceptions in business logic per D-54.
 */
export type Result<T, E> =
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

/**
 * Creates a successful Result.
 */
export function ok<T, E = never>(data: T): Result<T, E> {
  return { success: true, data };
}

/**
 * Creates an error Result.
 */
export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return { success: false, error };
}

/**
 * Type guard checking if result is success.
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard checking if result is failure.
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}
