import { PartnerCode } from '@poco/constants';
import type {
  RazorpayCreateOrderReqDto,
  RazorpayOrderResDto,
  RazorpayRefundReqDto,
  RazorpayRefundResDto,
  RazorpayWebhookPayloadDto
} from '@poco/validation';
import { createMockRazorpayOrder } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions, WebhookDispatchResult } from '../interfaces/partner-adapter.interface';

export class RazorpayAdapter extends BasePartnerAdapter<
  RazorpayCreateOrderReqDto | RazorpayRefundReqDto,
  RazorpayOrderResDto | RazorpayRefundResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.RAZORPAY, '/v1/orders', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    endpoint: string,
    payload: RazorpayCreateOrderReqDto | RazorpayRefundReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<RazorpayOrderResDto | RazorpayRefundResDto> {
    if (endpoint.includes('refund')) {
      const refundReq = payload as RazorpayRefundReqDto;
      const refundRes: RazorpayRefundResDto = {
        id: `rfnd_${Math.random().toString(36).substring(2, 14)}`,
        entity: 'refund',
        amount: refundReq.amount,
        currency: 'INR',
        payment_id: refundReq.paymentId,
        status: 'processed',
        speed_processed: 'instant',
        created_at: Math.floor(Date.now() / 1000)
      };

      if (this.scheduler) {
        this.scheduler.scheduleCallback(
          PartnerCode.RAZORPAY,
          'payment-status',
          {
            entity: 'event',
            event: 'refund.processed',
            payload: { refund: { entity: refundRes } },
            created_at: Math.floor(Date.now() / 1000)
          },
          1000
        );
      }

      return refundRes;
    }

    const orderReq = payload as RazorpayCreateOrderReqDto;
    const orderRes = createMockRazorpayOrder({
      amount: orderReq.amount,
      receipt: orderReq.receipt,
      notes: orderReq.notes
    });

    return orderRes;
  }

  /**
   * Simulates a payment capture webhook trigger.
   */
  public async simulatePaymentCapture(
    orderId: string,
    amountPaise: number,
    contact: string = '+919876543210',
    email: string = 'family@pocoeldercare.in'
  ): Promise<WebhookDispatchResult> {
    const paymentId = `pay_${Math.random().toString(36).substring(2, 16)}`;
    const webhookPayload: RazorpayWebhookPayloadDto = {
      entity: 'event',
      account_id: 'acc_PocoEldercare01',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: 'payment',
            amount: amountPaise,
            currency: 'INR',
            status: 'captured',
            order_id: orderId,
            method: 'upi',
            email,
            contact,
            created_at: Math.floor(Date.now() / 1000)
          }
        },
        order: {
          entity: {
            id: orderId,
            entity: 'order',
            amount: amountPaise,
            status: 'paid'
          }
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    };

    if (this.scheduler) {
      return this.scheduler.triggerInstantCallback(
        PartnerCode.RAZORPAY,
        'payment-status',
        webhookPayload as unknown as Record<string, unknown>
      );
    }

    return {
      success: true,
      statusCode: 200,
      responseBody: webhookPayload
    };
  }
}
