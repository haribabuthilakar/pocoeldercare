import type { Result } from '../common/result';
import type { DomainErrorCode } from '../common/errors';

export function assertSuccess<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`Expected Result to be ok, but got error: ${JSON.stringify(result.error)}`);
  }
  return result.value;
}

export function assertFailure<T, E extends { code: DomainErrorCode }>(
  result: Result<T, E>,
  expectedCode?: DomainErrorCode
): E {
  if (result.ok) {
    throw new Error(`Expected Result to be error, but got ok: ${JSON.stringify(result.value)}`);
  }
  if (expectedCode && result.error.code !== expectedCode) {
    throw new Error(
      `Expected error code ${expectedCode}, but received ${result.error.code} (${JSON.stringify(result.error)})`
    );
  }
  return result.error;
}
