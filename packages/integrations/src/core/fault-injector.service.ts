import type { PartnerCode } from '@poco/constants';
import { prisma } from '@poco/database';
import {
  DEFAULT_MOCK_SETTINGS
} from '../interfaces/mock-settings.interface';
import type { MockSettings } from '../interfaces/mock-settings.interface';
import type { PartnerExecutionError } from '../interfaces/partner-adapter.interface';

interface CacheEntry {
  settings: MockSettings;
  expiresAt: number;
}

export class FaultInjectorService {
  private readonly cache = new Map<PartnerCode, CacheEntry>();
  private readonly ttlMs = 30000; // 30 seconds TTL

  /**
   * Override mock settings directly in-memory (useful for tests and instant UI feedback).
   */
  public setMockSettings(partnerCode: PartnerCode, settings: Partial<MockSettings>): void {
    const existing = this.cache.get(partnerCode)?.settings ?? DEFAULT_MOCK_SETTINGS;
    const updated: MockSettings = { ...existing, ...settings };
    this.cache.set(partnerCode, {
      settings: updated,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  /**
   * Reset mock settings cache for a partner or all partners.
   */
  public clearCache(partnerCode?: PartnerCode): void {
    if (partnerCode) {
      this.cache.delete(partnerCode);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Retrieves active mock settings for a partner with caching and database fallback.
   */
  public async getMockSettings(partnerCode: PartnerCode): Promise<MockSettings> {
    const now = Date.now();
    const cached = this.cache.get(partnerCode);

    if (cached && cached.expiresAt > now) {
      return cached.settings;
    }

    try {
      const partner = await prisma.integrationPartner.findUnique({
        where: { partnerCode: partnerCode as any }
      });

      if (partner?.mockSettings && typeof partner.mockSettings === 'object') {
        const raw = partner.mockSettings as Record<string, unknown>;
        const settings: MockSettings = {
          latencyMs: typeof raw.latencyMs === 'number' ? Math.min(Math.max(raw.latencyMs, 0), 5000) : DEFAULT_MOCK_SETTINGS.latencyMs,
          failureRate: typeof raw.failureRate === 'number' ? Math.min(Math.max(raw.failureRate, 0), 1) : DEFAULT_MOCK_SETTINGS.failureRate,
          errorMode: (raw.errorMode as any) ?? DEFAULT_MOCK_SETTINGS.errorMode,
          autoCallbackEnabled: typeof raw.autoCallbackEnabled === 'boolean' ? raw.autoCallbackEnabled : DEFAULT_MOCK_SETTINGS.autoCallbackEnabled,
          autoCallbackDelayMs: typeof raw.autoCallbackDelayMs === 'number' ? raw.autoCallbackDelayMs : DEFAULT_MOCK_SETTINGS.autoCallbackDelayMs,
          customResponseTemplate: (raw.customResponseTemplate as Record<string, unknown>) ?? undefined
        };

        this.cache.set(partnerCode, { settings, expiresAt: now + this.ttlMs });
        return settings;
      }
    } catch {
      // Database unavailable or during unit testing
    }

    const fallback = DEFAULT_MOCK_SETTINGS;
    this.cache.set(partnerCode, { settings: fallback, expiresAt: now + this.ttlMs });
    return fallback;
  }

  /**
   * Evaluates dynamic fault injection and applies simulated latency.
   * Throws PartnerExecutionError if failure conditions are met.
   */
  public async evaluateAndDelay(partnerCode: PartnerCode): Promise<void> {
    const settings = await this.getMockSettings(partnerCode);

    // 1. Apply simulated latency (capped at 5000ms)
    if (settings.latencyMs > 0) {
      const delay = Math.min(settings.latencyMs, 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // 2. Evaluate failure probability
    const shouldFail = settings.failureRate > 0 && Math.random() < settings.failureRate;

    if (shouldFail || (settings.errorMode && settings.errorMode !== 'NONE')) {
      const mode = settings.errorMode !== 'NONE' ? settings.errorMode : 'HTTP_500_SERVER_ERROR';

      switch (mode) {
        case 'TIMEOUT_GATEWAY':
          throw {
            partnerCode,
            statusCode: 504,
            errorCode: 'GATEWAY_TIMEOUT',
            message: `Simulated 504 Gateway Timeout from ${partnerCode}`
          } satisfies PartnerExecutionError;

        case 'RATE_LIMIT_429':
          throw {
            partnerCode,
            statusCode: 429,
            errorCode: 'RATE_LIMITED',
            message: `Simulated 429 Rate Limit Exceeded from ${partnerCode}`
          } satisfies PartnerExecutionError;

        case 'INVALID_HMAC_SIGNATURE':
          throw {
            partnerCode,
            statusCode: 401,
            errorCode: 'INVALID_SIGNATURE',
            message: `Simulated 401 Unauthorized / Invalid HMAC signature for ${partnerCode}`
          } satisfies PartnerExecutionError;

        case 'HTTP_500_SERVER_ERROR':
        default:
          throw {
            partnerCode,
            statusCode: 500,
            errorCode: 'PARTNER_INTERNAL_ERROR',
            message: `Simulated 500 Internal Server Error from ${partnerCode}`
          } satisfies PartnerExecutionError;
      }
    }
  }
}
