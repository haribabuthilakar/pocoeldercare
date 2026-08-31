import { PartnerCode } from '@poco/constants';
import type {
  WhatsappSendTemplateReqDto,
  WhatsappMessageResDto,
  WhatsappStatusWebhookDto
} from '@poco/validation';
import {
  createMockWhatsappMessage
} from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class WhatsAppAdapter extends BasePartnerAdapter<
  WhatsappSendTemplateReqDto,
  WhatsappMessageResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.WHATSAPP, '/v19.0/poco_wa_phone_id/messages', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: WhatsappSendTemplateReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<WhatsappMessageResDto> {
    const res = createMockWhatsappMessage({
      contacts: [{ input: payload.to, waId: payload.to.replace(/\+/g, '') }]
    });

    const messageId = res.messages[0]?.id ?? `wamid.HBgL${Math.random().toString(36).substring(2, 14)}`;

    // Auto-schedule delivery receipt callbacks (SENT -> DELIVERED -> READ)
    if (this.scheduler) {
      this.scheduleReceipts(messageId, payload.to);
    }

    return res;
  }

  /**
   * Schedules simulated WhatsApp delivery status events.
   */
  public scheduleReceipts(messageId: string, recipientPhone: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const statuses: Array<{ status: WhatsappStatusWebhookDto['status']; delay: number }> = [
      { status: 'sent', delay: 1000 * delayScale },
      { status: 'delivered', delay: 3000 * delayScale },
      { status: 'read', delay: 6000 * delayScale }
    ];

    for (const { status, delay } of statuses) {
      const statusPayload: WhatsappStatusWebhookDto = {
        id: messageId,
        status,
        timestamp: new Date().toISOString(),
        recipientId: recipientPhone
      };

      this.scheduler.scheduleCallback(
        PartnerCode.WHATSAPP,
        'status',
        statusPayload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}
