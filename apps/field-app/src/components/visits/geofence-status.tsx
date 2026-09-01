import React from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates Haversine distance in meters between two GPS coordinates.
 */
export function calculateDistanceMeters(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeofenceStatusProps {
  deviceCoords?: Coordinates;
  targetCoords?: Coordinates;
  thresholdMeters?: number;
}

export const GeofenceStatus: React.FC<GeofenceStatusProps> = ({
  deviceCoords = { latitude: 12.9716, longitude: 77.6412 },
  targetCoords = { latitude: 12.9716, longitude: 77.6412 },
  thresholdMeters = 200,
}) => {
  const distance = calculateDistanceMeters(deviceCoords, targetCoords);
  const isWithinGeofence = distance <= thresholdMeters;

  return (
    <div
      data-testid="geofence-status-banner"
      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
        isWithinGeofence
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
          : 'bg-amber-50/70 border-amber-200 text-amber-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <MapPin className={`w-4 h-4 ${isWithinGeofence ? 'text-emerald-600' : 'text-amber-600'}`} />
        <div>
          <span className="font-semibold" data-testid="geofence-text">
            {isWithinGeofence
              ? `GPS Verified (${distance}m from household)`
              : `Outside Target Radius (${distance}m — Audit Logged)`}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isWithinGeofence
              ? 'Device GPS matches household address.'
              : 'Silent GPS discrepancy logged for ops review. Visit is not blocked.'}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {isWithinGeofence ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
            <AlertCircle className="w-3 h-3" />
            Logged
          </span>
        )}
      </div>
    </div>
  );
};
export default GeofenceStatus;
