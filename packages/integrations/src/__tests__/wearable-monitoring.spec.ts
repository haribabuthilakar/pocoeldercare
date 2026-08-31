import { describe, it, expect } from 'vitest';
import {
  wearableTelemetryPingSchema,
  wearableAlertWebhookSchema
} from '@poco/validation';

describe('Wearable IoT Telemetry & Heartbeat Monitoring Suite', () => {
  it('should validate hourly silent heartbeat ping without activity feed spam', () => {
    const pingPayload = {
      deviceId: 'WR-SENIOR-1092',
      seniorId: '11111111-2222-3333-4444-555555555555',
      timestamp: new Date().toISOString(),
      batteryPercentage: 84,
      stepCountToday: 3200,
      restingHeartRate: 70,
      spo2: 98
    };

    const parsed = wearableTelemetryPingSchema.safeParse(pingPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.batteryPercentage).toBe(84);
      expect(parsed.data.stepCountToday).toBe(3200);
    }
  });

  it('should calculate missed ping threshold (>75 minutes) correctly', () => {
    const now = Date.now();
    const seventyFourMinutesAgo = new Date(now - 74 * 60000);
    const seventySixMinutesAgo = new Date(now - 76 * 60000);

    const isOverdue = (lastPing: Date) => {
      return (now - lastPing.getTime()) > 75 * 60000;
    };

    expect(isOverdue(seventyFourMinutesAgo)).toBe(false);
    expect(isOverdue(seventySixMinutesAgo)).toBe(true);
  });

  it('should validate emergency SOS button alert metrics', () => {
    const sosPayload = {
      deviceId: 'WR-SENIOR-1092',
      seniorId: '11111111-2222-3333-4444-555555555555',
      alertType: 'SOS_BUTTON_PRESSED',
      timestamp: new Date().toISOString(),
      location: {
        lat: 12.9716,
        lng: 77.5946,
        accuracyMeters: 5
      }
    };

    const parsed = wearableAlertWebhookSchema.safeParse(sosPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.alertType).toBe('SOS_BUTTON_PRESSED');
      expect(parsed.data.location?.accuracyMeters).toBe(5);
    }
  });
});
