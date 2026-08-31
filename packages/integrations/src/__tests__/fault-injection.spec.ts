import { describe, it, expect, vi } from 'vitest';
import { FaultInjectorService } from '../core/fault-injector.service';
import { PartnerCode } from '@poco/constants';
import { RazorpayAdapter } from '../adapters/razorpay.adapter';
import { OutboundLoggerService } from '../core/outbound-logger.service';

describe('FaultInjectorService & Dynamic Error Simulation Suite', () => {
  const outboundLogger = new OutboundLoggerService();

  it('should inject simulated latency delay', async () => {
    const faultInjector = new FaultInjectorService();
    faultInjector.setMockSettings(PartnerCode.RAZORPAY, {
      latencyMs: 100,
      failureRate: 0,
      errorMode: 'NONE'
    });

    const start = Date.now();
    await faultInjector.evaluateAndDelay(PartnerCode.RAZORPAY);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(90);
  });

  it('should inject 100% failure rate with HTTP 500 error', async () => {
    const faultInjector = new FaultInjectorService();
    faultInjector.setMockSettings(PartnerCode.RAZORPAY, {
      latencyMs: 0,
      failureRate: 1.0,
      errorMode: 'NONE'
    });

    const adapter = new RazorpayAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      amount: 500000,
      currency: 'INR'
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.statusCode).toBe(500);
      expect(res.error.partnerCode).toBe(PartnerCode.RAZORPAY);
    }
  });

  it('should inject TIMEOUT_GATEWAY error mode (HTTP 504)', async () => {
    const faultInjector = new FaultInjectorService();
    faultInjector.setMockSettings(PartnerCode.RAZORPAY, {
      latencyMs: 0,
      failureRate: 0,
      errorMode: 'TIMEOUT_GATEWAY'
    });

    const adapter = new RazorpayAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      amount: 500000,
      currency: 'INR'
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.statusCode).toBe(504);
      expect(res.error.errorCode).toBe('GATEWAY_TIMEOUT');
    }
  });

  it('should inject RATE_LIMIT_429 error mode (HTTP 429)', async () => {
    const faultInjector = new FaultInjectorService();
    faultInjector.setMockSettings(PartnerCode.RAZORPAY, {
      latencyMs: 0,
      failureRate: 0,
      errorMode: 'RATE_LIMIT_429'
    });

    const adapter = new RazorpayAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      amount: 500000,
      currency: 'INR'
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.statusCode).toBe(429);
      expect(res.error.errorCode).toBe('RATE_LIMITED');
    }
  });

  it('should inject INVALID_HMAC_SIGNATURE error mode (HTTP 401)', async () => {
    const faultInjector = new FaultInjectorService();
    faultInjector.setMockSettings(PartnerCode.EXOTEL, {
      latencyMs: 0,
      failureRate: 0,
      errorMode: 'INVALID_HMAC_SIGNATURE'
    });

    await expect(faultInjector.evaluateAndDelay(PartnerCode.EXOTEL)).rejects.toMatchObject({
      statusCode: 401,
      errorCode: 'INVALID_SIGNATURE'
    });
  });
});
