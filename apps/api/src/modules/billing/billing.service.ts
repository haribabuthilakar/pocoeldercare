import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { BillingTransactionType } from '@poco/constants';
import { evaluateBillingAction, calculateGst } from '@poco/business-rules';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async processBillingForService(serviceRequestId: string) {
    const sr = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        ticket: {
          include: {
            household: {
              include: {
                wallet: true,
                subscriptions: {
                  where: { status: 'ACTIVE' },
                  include: {
                    quotaAllocations: {
                      where: {
                        billingPeriodEnd: { gte: new Date() },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        serviceCatalogVersion: {
          include: { serviceCatalog: true },
        },
      },
    });

    if (!sr) {
      throw new NotFoundException('Service request not found');
    }

    const household = sr.ticket.household;
    const wallet = household.wallet;
    if (!wallet) {
      throw new NotFoundException('Household wallet not found');
    }

    const isEmergency =
      sr.ticket.priority === 'EMERGENCY' || sr.serviceCatalogVersion.serviceCatalog.defaultIsEmergency;

    // Calculate available package quota
    const activeSub = household.subscriptions[0];
    const quotaAllocation = activeSub?.quotaAllocations.find(
      (q) => q.serviceCatalogId === sr.serviceCatalogVersion.serviceCatalogId,
    );
    const availableQuotaUnits = quotaAllocation
      ? Math.max(0, quotaAllocation.allocatedUnits - quotaAllocation.usedUnits)
      : 0;

    const decision = evaluateBillingAction({
      serviceBasePricePaise: sr.unitPricePaise,
      availableQuotaUnits,
      isEmergency,
      walletCurrentBalancePaise: wallet.balancePaise,
      creditLimitPaise: wallet.creditLimitPaise,
    });

    return this.prisma.$transaction(async (tx) => {
      if (decision.action === 'AUTO_DEBIT_QUOTA' && quotaAllocation) {
        // Step 1: Decrement Quota
        await tx.quotaAllocation.update({
          where: { id: quotaAllocation.id },
          data: { usedUnits: { increment: 1 } },
        });

        return {
          success: true,
          action: decision.action,
          amountPaise: 0,
          reason: decision.reason,
        };
      }

      if (decision.action === 'AUTO_DEBIT_WALLET' || decision.action === 'EMERGENCY_NEGATIVE_DEBIT') {
        // Step 2: Debit Wallet
        const newBalance = wallet.balancePaise - decision.totalAmountPaise;

        await tx.householdWallet.update({
          where: { id: wallet.id },
          data: { balancePaise: newBalance },
        });

        const txRecord = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amountPaise: -decision.totalAmountPaise,
            balanceAfterPaise: newBalance,
            type:
              decision.action === 'EMERGENCY_NEGATIVE_DEBIT'
                ? BillingTransactionType.EMERGENCY_OVERDRAFT
                : BillingTransactionType.WALLET_DEBIT,
            description: `Debit for service request ${sr.id} (${sr.serviceCatalogVersion.serviceCatalog.name})`,
            referenceEntityType: 'SERVICE_REQUEST',
            referenceEntityId: sr.id,
          },
        });

        return {
          success: true,
          action: decision.action,
          amountPaise: decision.totalAmountPaise,
          walletTransactionId: txRecord.id,
          balanceAfterPaise: newBalance,
          reason: decision.reason,
        };
      }

      // Step 3: Require approval / top-up
      return {
        success: false,
        action: decision.action,
        approvalRequired: true,
        amountPaise: decision.totalAmountPaise,
        shortfallPaise: decision.totalAmountPaise - (wallet.balancePaise + wallet.creditLimitPaise),
        reason: decision.reason,
      };
    });
  }

  async getHouseholdWallet(householdId: string) {
    let wallet = await this.prisma.householdWallet.findUnique({
      where: { householdId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.householdWallet.create({
        data: {
          householdId,
          balancePaise: 0,
          creditLimitPaise: 0,
        },
        include: { transactions: true },
      });
    }

    return {
      id: wallet.id,
      householdId: wallet.householdId,
      balancePaise: wallet.balancePaise,
      balanceInr: wallet.balancePaise / 100,
      creditLimitPaise: wallet.creditLimitPaise,
      transactions: wallet.transactions.map((t) => ({
        id: t.id,
        amountPaise: t.amountPaise,
        amountInr: t.amountPaise / 100,
        balanceAfterPaise: t.balanceAfterPaise,
        balanceAfterInr: t.balanceAfterPaise / 100,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
    };
  }

  async createTopUpOrder(householdId: string, amountPaise: number) {
    if (amountPaise < 10000) {
      throw new BadRequestException('Minimum top-up amount is ₹100');
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId,
      amountPaise,
      amountInr: amountPaise / 100,
      currency: 'INR',
      keyId: 'rzp_test_mock_poco',
    };
  }

  async creditWalletFromWebhook(householdId: string, amountPaise: number, paymentId: string) {
    let wallet = await this.prisma.householdWallet.findUnique({
      where: { householdId },
    });

    if (!wallet) {
      wallet = await this.prisma.householdWallet.create({
        data: { householdId, balancePaise: 0 },
      });
    }

    const newBalance = wallet.balancePaise + amountPaise;

    return this.prisma.$transaction(async (tx) => {
      await tx.householdWallet.update({
        where: { id: wallet.id },
        data: { balancePaise: newBalance },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amountPaise,
          balanceAfterPaise: newBalance,
          type: BillingTransactionType.WALLET_CREDIT,
          description: `Wallet top-up via Razorpay payment ${paymentId}`,
          referenceEntityType: 'RAZORPAY_PAYMENT',
          referenceEntityId: paymentId,
        },
      });

      return {
        success: true,
        walletId: wallet.id,
        newBalancePaise: newBalance,
        transactionId: txRecord.id,
      };
    });
  }

  async generateInvoice(transactionId: string) {
    const tx = await this.prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: { include: { household: true } },
      },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const gst = calculateGst(Math.abs(tx.amountPaise));
    return {
      invoiceNumber: `INV-${tx.id.substring(0, 8).toUpperCase()}`,
      householdName: tx.wallet.household.name,
      transactionType: tx.type,
      date: tx.createdAt,
      baseAmountPaise: gst.basePaise,
      gstPaise: gst.gstPaise,
      totalAmountPaise: gst.totalPaise,
      description: tx.description,
    };
  }
}
