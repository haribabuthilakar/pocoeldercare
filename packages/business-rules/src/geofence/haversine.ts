const EARTH_RADIUS_METERS = 6371000; // Earth mean radius in meters

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * Zero external dependencies per D-58.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
}

export interface GeofenceValidationResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  maxRadiusMeters: number;
}

/**
 * Validates if an officer's GPS location is within the acceptable geofence radius of the household.
 * Default max radius: 200 meters.
 */
export function validateGeofence(
  officerLat: number,
  officerLng: number,
  targetLat: number,
  targetLng: number,
  maxRadiusMeters = 200
): GeofenceValidationResult {
  const distanceMeters = calculateDistanceMeters(officerLat, officerLng, targetLat, targetLng);

  return {
    isWithinGeofence: distanceMeters <= maxRadiusMeters,
    distanceMeters,
    maxRadiusMeters
  };
}
