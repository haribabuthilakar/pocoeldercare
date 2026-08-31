import { verifyWebhookSignature } from '@poco/business-rules';
import { PartnerCode } from '@poco/constants';
import { prisma } from '@poco/database';

export interface WebhookRequestLike {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string;
  body?: unknown;
  params?: Record<string, string>;
}

export class WebhookHmacGuard {
  private readonly defaultSecret: string;

  constructor(defaultSecret?: string) {
    this.defaultSecret = defaultSecret ?? process.env.WEBHOOK_SECRET ?? 'poco_mock_webhook_secret_key_2026';
  }

  /**
   * Resolves partner secret from database or env.
   */
  public async getPartnerSecret(partnerCode: PartnerCode): Promise<string> {
    try {
      const partner = await prisma.integrationPartner.findUnique({
        where: { partnerCode: partnerCode as any }
      });

      if (partner?.mockSettings && typeof partner.mockSettings === 'object') {
        const raw = partner.mockSettings as Record<string, unknown>;
        if (typeof raw.webhookSecret === 'string') {
          return raw.webhookSecret;
        }
      }
    } catch {
      // Fall back to env or default
    }

    return process.env[`${partnerCode}_WEBHOOK_SECRET`] ?? this.defaultSecret;
  }

  /**
   * Validates inbound webhook request signature.
   */
  public async validateRequest(
    req: WebhookRequestLike,
    partnerCode: PartnerCode
  ): Promise<{ isValid: boolean; error?: string }> {
    const headers = req.headers;
    const signature =
      (headers['x-razorpay-signature'] as string) ||
      (headers['x-exotel-signature'] as string) ||
      (headers['x-signature-sha256'] as string) ||
      (headers['x-signature'] as string) ||
      (headers['x-hub-signature-256'] as string);

    // In dev / test environments with explicit bypass header
    if (process.env.NODE_ENV !== 'production' && headers['x-bypass-hmac'] === 'true') {
      return { isValid: true };
    }

    if (!signature) {
      return { isValid: false, error: 'Missing webhook signature header' };
    }

    const rawBody = req.rawBody ?? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    if (!rawBody) {
      return { isValid: false, error: 'Empty webhook payload body' };
    }

    const secret = await this.getPartnerSecret(partnerCode);
    const isValid = verifyWebhookSignature(rawBody, signature, secret, 'sha256');

    if (!isValid) {
      return { isValid: false, error: 'Invalid HMAC signature' };
    }

    return { isValid: true };
  }
}
