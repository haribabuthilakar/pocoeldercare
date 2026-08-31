import { PartnerCode } from '@poco/constants';
import { WebhookHmacGuard } from './guards/webhook-hmac.guard';
import type { WebhookRequestLike } from './guards/webhook-hmac.guard';
import { WebhooksService } from './webhooks.service';

export class WebhooksController {
  constructor(
    private readonly webhooksService = new WebhooksService(),
    private readonly hmacGuard = new WebhookHmacGuard()
  ) {}

  /**
   * Universal dispatcher verifying HMAC and calling WebhooksService.
   */
  public async handleWebhook(
    partnerCodeParam: string,
    req: WebhookRequestLike,
    subRoute?: string
  ): Promise<{ success: boolean; data?: unknown; error?: string; statusCode: number }> {
    const partnerCode = partnerCodeParam.toUpperCase().replace(/-/g, '_') as PartnerCode;

    // 1. Validate HMAC signature
    const validation = await this.hmacGuard.validateRequest(req, partnerCode);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error ?? 'Unauthorized',
        statusCode: 401
      };
    }

    // 2. Extract idempotency key
    const headers = req.headers;
    const idempotencyKey =
      (headers['x-idempotency-key'] as string) ||
      (headers['idempotency-key'] as string) ||
      `auto_${partnerCode}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payload = (req.body as Record<string, unknown>) ?? {};

    // 3. Ingest webhook
    try {
      const result = await this.webhooksService.ingestWebhook(
        partnerCode,
        idempotencyKey,
        payload,
        subRoute
      );

      return {
        success: true,
        data: result,
        statusCode: 200
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: errorMessage,
        statusCode: 500
      };
    }
  }

  // Route-specific handler convenience methods
  public async handleRazorpay(req: WebhookRequestLike) {
    return this.handleWebhook('RAZORPAY', req);
  }

  public async handleExotel(req: WebhookRequestLike) {
    return this.handleWebhook('EXOTEL', req);
  }

  public async handleWearablePing(req: WebhookRequestLike) {
    return this.handleWebhook('WEARABLE_IOT', req, 'ping');
  }

  public async handleWearableFallAlert(req: WebhookRequestLike) {
    return this.handleWebhook('WEARABLE_IOT', req, 'fall-alert');
  }
}
