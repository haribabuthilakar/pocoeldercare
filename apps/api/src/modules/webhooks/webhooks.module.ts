import { WebhookHmacGuard } from './guards/webhook-hmac.guard';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { RazorpayWebhookHandler } from './handlers/razorpay-webhook.handler';
import { ExotelWebhookHandler } from './handlers/exotel-webhook.handler';
import { LoopClosedWebhookHandler } from './handlers/loop-closed-webhook.handler';
import { WearableWebhookHandler } from './handlers/wearable-webhook.handler';
import { WearablePingScannerJob } from '../jobs/wearable-ping-scanner.job';

export class WebhooksModule {
  public static readonly providers = [
    WebhookHmacGuard,
    WebhooksService,
    RazorpayWebhookHandler,
    ExotelWebhookHandler,
    LoopClosedWebhookHandler,
    WearableWebhookHandler,
    WearablePingScannerJob
  ];

  public static readonly controllers = [WebhooksController];

  public static readonly exports = [WebhooksService, WearablePingScannerJob];
}
