import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TopupWalletDto } from './dto/topup-wallet.dto';
import { HoldFundsDto } from './dto/hold-funds.dto';
import { TransactionTypeEnum } from '@poco/database';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getWalletByHousehold(householdId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { householdId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          householdId,
          balancePaise: 0,
        },
        include: { transactions: true },
      });
    }

    return wallet;
  }

  async topupWallet(walletId: string, dto: TopupWalletDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new NotFoundException(`Wallet ${walletId} not found`);
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balancePaise: { increment: dto.amountPaise },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          amountPaise: dto.amountPaise,
          type: TransactionTypeEnum.CREDIT,
          referenceType: 'PAYMENT_GATEWAY',
          referenceId: dto.paymentReference,
          description: dto.description,
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });
  }

  async holdFunds(dto: HoldFundsDto) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: dto.walletId } });
      if (!wallet) {
        throw new NotFoundException(`Wallet ${dto.walletId} not found`);
      }

      if (wallet.balancePaise < dto.amountPaise) {
        throw new BadRequestException(
          `Insufficient wallet balance. Available: ₹${(wallet.balancePaise / 100).toFixed(2)}, Required: ₹${(dto.amountPaise / 100).toFixed(2)}`,
        );
      }

      // Deduct balance and create HOLD ledger entry
      const updatedWallet = await tx.wallet.update({
        where: { id: dto.walletId },
        data: {
          balancePaise: { decrement: dto.amountPaise },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: dto.walletId,
          amountPaise: dto.amountPaise,
          type: TransactionTypeEnum.HOLD,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: dto.serviceExecutionId,
          description: dto.description,
        },
      });

      return {
        wallet: updatedWallet,
        holdTransaction: transaction,
      };
    });
  }

  async settleHold(serviceExecutionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.walletTransaction.findFirst({
        where: {
          referenceId: serviceExecutionId,
          type: TransactionTypeEnum.HOLD,
        },
      });

      if (!hold) {
        throw new NotFoundException(`No active hold found for service execution ${serviceExecutionId}`);
      }

      const settleTx = await tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          amountPaise: hold.amountPaise,
          type: TransactionTypeEnum.DEBIT,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: serviceExecutionId,
          description: `Settled charge for execution ${serviceExecutionId}`,
        },
      });

      return settleTx;
    });
  }

  async refundHold(serviceExecutionId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const hold = await tx.walletTransaction.findFirst({
        where: {
          referenceId: serviceExecutionId,
          type: TransactionTypeEnum.HOLD,
        },
      });

      if (!hold) {
        throw new NotFoundException(`No active hold found for service execution ${serviceExecutionId}`);
      }

      // Refund held amount back to wallet balance
      const wallet = await tx.wallet.update({
        where: { id: hold.walletId },
        data: {
          balancePaise: { increment: hold.amountPaise },
        },
      });

      const refundTx = await tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          amountPaise: hold.amountPaise,
          type: TransactionTypeEnum.REFUND,
          referenceType: 'SERVICE_EXECUTION',
          referenceId: serviceExecutionId,
          description: `Refunded: ${reason}`,
        },
      });

      return {
        wallet,
        refundTransaction: refundTx,
      };
    });
  }

  async generateMonthlyInvoiceRollup(householdId: string, yearMonth: string) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: {
        subscriptions: { include: { planTier: true } },
        wallet: {
          include: {
            transactions: {
              where: {
                type: TransactionTypeEnum.DEBIT,
              },
            },
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException(`Household ${householdId} not found`);
    }

    const activeSub = household.subscriptions[0];
    const planFeePaise = activeSub ? Math.round(activeSub.planTier.annualPricePaise / 12) : 0;
    const walletDebits = household.wallet?.transactions || [];
    const extraUsagePaise = walletDebits.reduce((acc, tx) => acc + tx.amountPaise, 0);

    return {
      invoiceId: `INV-${householdId.substring(0, 8)}-${yearMonth}`,
      householdId,
      householdName: household.name,
      billingCycle: yearMonth,
      currency: 'INR',
      planSubscriptionFeePaise: planFeePaise,
      planTier: activeSub?.planTier.name || 'NONE',
      payPerUseExtrasPaise: extraUsagePaise,
      totalPaise: planFeePaise + extraUsagePaise,
      totalFormatted: `₹${((planFeePaise + extraUsagePaise) / 100).toFixed(2)}`,
      generatedAt: new Date().toISOString(),
    };
  }
}
