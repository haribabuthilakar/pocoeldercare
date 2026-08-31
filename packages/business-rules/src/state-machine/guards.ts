import { ServiceRequestStatus, TicketStatus } from '@poco/constants';

/**
 * Guard: Check if all child service requests are completed or closed.
 */
export function areAllChildRequestsFinished(childStatuses: ServiceRequestStatus[]): boolean {
  if (childStatuses.length === 0) return true;
  return childStatuses.every(
    (status) => status === ServiceRequestStatus.COMPLETED || status === ServiceRequestStatus.CANCELLED
  );
}

/**
 * Guard: Check if any child service request is currently in an exception or in-progress state.
 */
export function hasActiveChildRequests(childStatuses: ServiceRequestStatus[]): boolean {
  return childStatuses.some(
    (status) =>
      status === ServiceRequestStatus.IN_PROGRESS ||
      status === ServiceRequestStatus.IN_TRANSIT ||
      status === ServiceRequestStatus.ON_SITE ||
      status === ServiceRequestStatus.ACCEPTED
  );
}

/**
 * Guard: Check if geofence check-in was verified.
 */
export function isGeofenceVerified(distanceMeters: number, maxRadiusMeters = 200): boolean {
  return distanceMeters <= maxRadiusMeters;
}
