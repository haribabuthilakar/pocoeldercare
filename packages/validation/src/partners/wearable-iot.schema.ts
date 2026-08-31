import { z } from 'zod';

export const wearableTelemetryPingSchema = z.object({
  deviceId: z.string().trim().min(1),
  seniorId: z.string().uuid(),
  timestamp: z.coerce.date(),
  batteryPercentage: z.number().min(0).max(100),
  stepCountToday: z.number().int().nonnegative().optional(),
  restingHeartRate: z.number().int().positive().optional(),
  spo2: z.number().int().min(50).max(100).optional(),
  firmwareVersion: z.string().optional()
});

export type WearableTelemetryPingDto = z.infer<typeof wearableTelemetryPingSchema>;

export const wearableAlertWebhookSchema = z.object({
  deviceId: z.string().trim().min(1),
  seniorId: z.string().uuid(),
  alertType: z.enum([
    'FALL_DETECTED',
    'SOS_BUTTON_PRESSED',
    'HEART_RATE_SPIKE',
    'SPO2_DROP',
    'BATTERY_CRITICAL'
  ]),
  timestamp: z.coerce.date(),
  metrics: z.object({
    impactGForce: z.number().optional(), // e.g. 3.8g for fall
    heartRateBpm: z.number().int().optional(),
    spo2: z.number().int().optional(),
    motionDetectedAfterSeconds: z.number().optional()
  }).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracyMeters: z.number().optional()
  }).optional(),
  batteryPercentage: z.number().min(0).max(100).optional()
});

export type WearableAlertWebhookDto = z.infer<typeof wearableAlertWebhookSchema>;
