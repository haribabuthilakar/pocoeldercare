import { z } from 'zod';
import { uuidSchema } from '../common/formats';

/**
 * Razorpay Payment Gateway Webhook Payload Schema.
 */
export const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number().int(),
          currency: z.literal('INR'),
          status: z.string(),
          order_id: z.string().optional(),
          notes: z.record(z.string(), z.any()).optional()
        })
      })
      .optional(),
    order: z
      .object({
        entity: z.object({
          id: z.string(),
          amount: z.number().int(),
          currency: z.literal('INR'),
          status: z.string()
        })
      })
      .optional()
  })
});

export type RazorpayWebhookDto = z.infer<typeof razorpayWebhookSchema>;

/**
 * Exotel Telephony Webhook Payload Schema.
 */
export const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  From: z.string(),
  To: z.string(),
  CallType: z.string().optional(),
  DialCallDuration: z.coerce.number().optional(),
  Status: z.string(),
  RecordingUrl: z.string().url().optional()
});

export type ExotelWebhookDto = z.infer<typeof exotelWebhookSchema>;

/**
 * Wearable IoT Fall & Vital Alert Webhook Schema.
 */
export const wearableAlertSchema = z.object({
  deviceId: z.string().trim().min(1),
  seniorId: uuidSchema,
  alertType: z.enum(['FALL_DETECTED', 'HEART_RATE_SPIKE', 'SPO2_DROP', 'SOS_BUTTON_PRESSED']),
  timestamp: z.coerce.date(),
  metrics: z.record(z.string(), z.any()).optional(),
  batteryPercentage: z.number().min(0).max(100).optional()
});

export type WearableAlertDto = z.infer<typeof wearableAlertSchema>;

/**
 * Pococare EMR Medical Record Sync Webhook Schema.
 */
export const pococareSyncSchema = z.object({
  patientId: z.string(),
  medicalRecordId: z.string(),
  recordType: z.enum(['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'VITALS_SNAPSHOT']),
  documentUrl: z.string().url().optional(),
  extractedData: z.record(z.string(), z.any()).optional(),
  syncedAt: z.coerce.date()
});

export type PococareSyncDto = z.infer<typeof pococareSyncSchema>;
