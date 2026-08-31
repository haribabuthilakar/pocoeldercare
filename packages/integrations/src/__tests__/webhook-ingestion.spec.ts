import { describe, it, expect } from 'vitest';
import { signWebhookPayload, verifyWebhookSignature } from '@poco/business-rules';
import {
  razorpayWebhookPayloadSchema,
  wearableAlertWebhookSchema
} from '@poco/validation';

describe('Webhook Ingestion & HMAC Verification Invariants Suite', () => {
  const secretKey = 'test_webhook_hmac_secret_2026';

  it('should generate valid HMAC-SHA256 signature and verify successfully', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      amount: 500000,
      timestamp: Date.now()
    });

    const signature = signWebhookPayload(rawPayload, secretKey, 'sha256');
    expect(signature).toBeDefined();

    const isValid = verifyWebhookSignature(rawPayload, signature, secretKey, 'sha256');
    expect(isValid).toBe(true);
  });

  it('should reject tampered payload or incorrect secret with timing-safe comparison', () => {
    const originalPayload = JSON.stringify({ event: 'payment.captured', amount: 500000 });
    const tamperedPayload = JSON.stringify({ event: 'payment.captured', amount: 999999 });

    const signature = signWebhookPayload(originalPayload, secretKey, 'sha256');

    const isValidWithTampered = verifyWebhookSignature(tamperedPayload, signature, secretKey, 'sha256');
    expect(isValidWithTampered).toBe(false);

    const isValidWithWrongSecret = verifyWebhookSignature(originalPayload, signature, 'wrong_secret', 'sha256');
    expect(isValidWithWrongSecret).toBe(false);
  });

  it('should validate Razorpay payment webhook schema', () => {
    const validRazorpayPayload = {
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_001',
            entity: 'payment',
            amount: 500000,
            currency: 'INR',
            status: 'captured',
            method: 'upi'
          }
        }
      }
    };

    const parsed = razorpayWebhookPayloadSchema.safeParse(validRazorpayPayload);
    expect(parsed.success).toBe(true);
  });

  it('should validate Wearable emergency fall alert webhook schema', () => {
    const validFallAlert = {
      deviceId: 'WR-SENIOR-1092',
      seniorId: '11111111-2222-3333-4444-555555555555',
      alertType: 'FALL_DETECTED',
      timestamp: new Date().toISOString(),
      metrics: {
        impactGForce: 3.8,
        heartRateBpm: 125,
        spo2: 95
      }
    };

    const parsed = wearableAlertWebhookSchema.safeParse(validFallAlert);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.alertType).toBe('FALL_DETECTED');
      expect(parsed.data.metrics?.impactGForce).toBe(3.8);
    }
  });
});
