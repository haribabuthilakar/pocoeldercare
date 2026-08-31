import type { PartnerCode } from '@poco/constants';
import { prisma } from '@poco/database';

export interface OutboundLogEntry {
  partnerCode: PartnerCode;
  endpoint: string;
  requestPayload: unknown;
  responseStatus: number;
  durationMs: number;
  errorMessage?: string;
  householdId?: string;
  ticketId?: string;
  serviceRequestId?: string;
}

export class OutboundLoggerService {
  /**
   * Masks sensitive PII such as Aadhaar numbers, CVV, Card numbers, and OTPs.
   */
  public maskPii(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskPii(item));
    }

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      if (typeof value === 'string') {
        if (lowerKey.includes('aadhaar') || /^\d{12}$/.test(value)) {
          masked[key] = value.replace(/^(\d{8})(\d{4})$/, '••••••••$2');
        } else if (lowerKey.includes('card') && /^\d{16}$/.test(value)) {
          masked[key] = value.replace(/^(\d{12})(\d{4})$/, '••••••••••••$2');
        } else if (lowerKey.includes('cvv') || lowerKey.includes('otp')) {
          masked[key] = '•••';
        } else if (lowerKey.includes('password') || lowerKey.includes('secret')) {
          masked[key] = '••••••••';
        } else {
          masked[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskPii(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Persists an outbound integration call audit entry to the database.
   */
  public async logOutboundCall(entry: OutboundLogEntry): Promise<void> {
    try {
      const sanitizedPayload = this.maskPii(entry.requestPayload);

      await prisma.outboundIntegrationCall.create({
        data: {
          partnerCode: entry.partnerCode as any,
          endpoint: entry.endpoint,
          requestPayload: sanitizedPayload as any,
          responseStatus: entry.responseStatus,
          durationMs: entry.durationMs,
          errorMessage: entry.errorMessage ?? null,
          householdId: entry.householdId ?? null,
          ticketId: entry.ticketId ?? null,
          serviceRequestId: entry.serviceRequestId ?? null
        }
      });
    } catch (err: unknown) {
      // In-memory or testing environment fallback without crashing
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[OutboundLoggerService] Failed to persist outbound call log: ${errorMessage}`);
    }
  }
}
