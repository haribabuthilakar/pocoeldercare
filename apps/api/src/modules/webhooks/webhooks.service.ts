import { PartnerCode } from '@poco/constants';
import { prisma } from '@poco/database';
import { RazorpayWebhookHandler } from './handlers/razorpay-webhook.handler';
import { ExotelWebhookHandler } from './handlers/exotel-webhook.handler';
import { LoopClosedWebhookHandler } from './handlers/loop-closed-webhook.handler';
import { WearableWebhookHandler } from './handlers/wearable-webhook.handler';

export class WebhooksService {
  constructor(
    private readonly razorpayHandler = new RazorpayWebhookHandler(),
    private readonly exotelHandler = new ExotelWebhookHandler(),
    private readonly loopClosedHandler = new LoopClosedWebhookHandler(),
    private readonly wearableHandler = new WearableWebhookHandler()
  ) {}

  /**
   * Ingests an inbound webhook with transactional idempotency enforcement.
   */
  public async ingestWebhook(
    source: PartnerCode,
    idempotencyKey: string,
    payload: Record<string, unknown>,
    subRoute?: string
  ): Promise<{ status: string; cached?: boolean; result?: unknown }> {
    // 1. Idempotency Check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { idempotencyKey }
    });

    if (existingEvent) {
      if (existingEvent.status === 'PROCESSED') {
        return {
          status: 'PROCESSED',
          cached: true,
          result: { message: 'Idempotent duplicate webhook acknowledged', eventId: existingEvent.id }
        };
      }
    }

    // 2. Insert or mark as PENDING
    const webhookRecord = existingEvent
      ? existingEvent
      : await prisma.webhookEvent.create({
          data: {
            source: source as any,
            idempotencyKey,
            payload: payload as any,
            status: 'PENDING'
          }
        });

    // 3. Dispatch to appropriate handler
    try {
      let result: unknown;

      if (source === PartnerCode.RAZORPAY) {
        result = await this.razorpayHandler.handle(payload);
      } else if (source === PartnerCode.EXOTEL) {
        result = await this.exotelHandler.handle(payload);
      } else if (source === PartnerCode.WEARABLE_IOT) {
        if (subRoute === 'ping') {
          result = await this.wearableHandler.handlePing(payload);
        } else {
          result = await this.wearableHandler.handleFallAlert(payload);
        }
      } else {
        result = await this.loopClosedHandler.handle(source, payload as any);
      }

      // 4. Mark as PROCESSED on success
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date()
        }
      });

      return { status: 'PROCESSED', cached: false, result };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Mark as FAILED on error
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: 'FAILED',
          errorMessage
        }
      });

      throw err;
    }
  }
}
