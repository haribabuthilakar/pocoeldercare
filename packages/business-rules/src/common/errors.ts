/**
 * Domain error codes for business rule validation failures.
 */
export enum DomainErrorCode {
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  UNAUTHORIZED_ROLE = 'UNAUTHORIZED_ROLE',
  CARE_OFFICER_NOT_ASSIGNED = 'CARE_OFFICER_NOT_ASSIGNED',
  CARE_OFFICER_ALREADY_ASSIGNED = 'CARE_OFFICER_ALREADY_ASSIGNED',
  CERTIFICATION_MISSING_OR_EXPIRED = 'CERTIFICATION_MISSING_OR_EXPIRED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_QUOTA = 'INSUFFICIENT_QUOTA',
  CANNOT_COMPLETE_UNVERIFIED_GEOFENCE = 'CANNOT_COMPLETE_UNVERIFIED_GEOFENCE',
  CANNOT_CLOSE_OPEN_CHILDREN = 'CANNOT_CLOSE_OPEN_CHILDREN',
  INCOMPLETE_SOP_STEPS = 'INCOMPLETE_SOP_STEPS',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND'
}

/**
 * Structured Domain Error class containing error code, message, and metadata.
 */
export class DomainError {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly message: string,
    public readonly metadata?: Record<string, unknown>
  ) {}

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      metadata: this.metadata
    };
  }
}
