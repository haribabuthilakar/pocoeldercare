import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CallbackSchedulerService } from '../core/callback-scheduler.service';
import { PartnerCode } from '@poco/constants';
import { verifyWebhookSignature } from '@poco/business-rules';

describe('CallbackSchedulerService & Asynchronous Progression Suite', () => {
  let scheduler: CallbackSchedulerService;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new CallbackSchedulerService({
      baseUrl: 'http://localhost:3000',
      webhookSecret: 'test_secret_key_123'
    });
  });

  afterEach(() => {
    scheduler.clearAllTimers();
    vi.useRealTimers();
  });

  it('should schedule delayed callback timer and execute dispatch', async () => {
    const originalFetch = global.fetch;
    const callbackSpy = vi.fn();
    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      callbackSpy(url, init);
      return { ok: true, status: 200, json: async () => ({ status: 'PROCESSED' }) };
    });

    try {
      scheduler.scheduleCallback(
        PartnerCode.POCOCARE,
        'ambulance',
        { stage: 'PARAMEDIC_ASSIGNED' },
        2000
      );

      expect(callbackSpy).not.toHaveBeenCalled();

      // Fast-forward 2s
      await vi.advanceTimersByTimeAsync(2000);
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should sign webhook payloads with HMAC-SHA256 headers matching verifyWebhookSignature', async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = '';

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedHeaders = init.headers as Record<string, string>;
      capturedBody = init.body as string;
      return { ok: true, status: 200, json: async () => ({ status: 'PROCESSED' }) };
    });

    try {
      await scheduler.triggerInstantCallback(PartnerCode.RAZORPAY, 'payment.captured', {
        event: 'payment.captured',
        amount: 500000
      });

      expect(capturedHeaders['X-Signature-SHA256']).toBeDefined();
      expect(capturedHeaders['X-Idempotency-Key']).toBeDefined();

      const isValid = verifyWebhookSignature(
        capturedBody,
        capturedHeaders['X-Signature-SHA256'],
        'test_secret_key_123',
        'sha256'
      );

      expect(isValid).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
