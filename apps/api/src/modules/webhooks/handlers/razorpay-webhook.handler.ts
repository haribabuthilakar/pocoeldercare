import { prisma } from '@poco/database';
import { razorpayWebhookPayloadSchema } from '@poco/validation';
import type { RazorpayWebhookPayloadDto } from '@poco/validation';

export class RazorpayWebhookHandler {
  /**
   * Processes verified Razorpay payment/refund webhook events.
   */
  public async handle(payload: unknown): Promise<{ processed: boolean; event: string; details?: unknown }> {
    const parsed = razorpayWebhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid Razorpay webhook payload: ${parsed.error.message}`);
    }

    const event = parsed.data;

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment?.entity;
        if (!payment) {
          throw new Error('Missing payment entity in payment.captured webhook');
        }

        const amountPaise = payment.amount;
        const householdId = (payment.notes?.householdId as string) || (event.payload.order?.entity?.notes?.householdId as string);

        if (householdId) {
          await prisma.$transaction(async (tx) => {
            // Find or create wallet
            let wallet = await tx.householdWallet.findUnique({
              where: { householdId }
            });

            if (!wallet) {
              wallet = await tx.householdWallet.create({
                data: {
                  householdId,
                  balancePaise: amountPaise
                }
              });
            } else {
              wallet = await tx.householdWallet.update({
                where: { householdId },
                data: {
                  balancePaise: { increment: amountPaise }
                }
              });
            }

            // Create ledger entry
            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amountPaise,
                balanceAfterPaise: wallet.balancePaise,
                type: 'WALLET_CREDIT',
                description: `Payment top-up via Razorpay (${payment.id})`,
                referenceEntityType: 'RAZORPAY_PAYMENT',
                referenceEntityId: payment.id
              }
            });

            // Write Activity Feed Event
            await tx.activityFeedItem.create({
              data: {
                householdId,
                actorType: 'SYSTEM',
                senderName: 'Billing & Payments',
                eventType: 'BILLING_EVENT',
                content: `Wallet credited with ₹${(amountPaise / 100).toFixed(2)} via ${payment.method?.toUpperCase() || 'UPI/Card'}. Current balance: ₹${(wallet.balancePaise / 100).toFixed(2)}.`
              }
            });
          });
        }

        return { processed: true, event: event.event, details: { paymentId: payment.id, amountPaise } };
      }

      case 'payment.failed': {
        const payment = event.payload.payment?.entity;
        return {
          processed: true,
          event: event.event,
          details: {
            paymentId: payment?.id,
            errorCode: payment?.error_code,
            description: payment?.error_description
          }
        };
      }

      case 'refund.processed': {
        const refund = event.payload.refund?.entity;
        return {
          processed: true,
          event: event.event,
          details: { refundId: refund?.id, amount: refund?.amount }
        };
      }

      default:
        return { processed: true, event: event.event };
    }
  }
}
