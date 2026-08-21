import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { BillingService } from '../modules/billing/billing.service';
import { PrismaService } from '../database/prisma.service';

describe('Billing & Wallet Ledger Integration', () => {
  let billingService: BillingService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [BillingService],
    }).compile();

    billingService = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should query household wallet balance and perform atomic top-up', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    expect(household).toBeDefined();

    const wallet = await billingService.getWalletByHousehold(household!.id);
    const initialBalance = wallet.balancePaise;

    const topup = await billingService.topupWallet(wallet.id, {
      amountPaise: 500000, // ₹5,000
      paymentReference: `PG-TEST-${Date.now()}`,
      description: 'Razorpay NetBanking wallet topup',
    });

    expect(topup.wallet.balancePaise).toBe(initialBalance + 500000);
  });

  it('should atomically hold funds and settle upon service completion', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const wallet = await billingService.getWalletByHousehold(household!.id);
    const startingBalance = wallet.balancePaise;
    const testExecutionId = `exec-test-${Date.now()}`;

    // 1. Hold ₹1,500
    const holdRes = await billingService.holdFunds({
      walletId: wallet.id,
      amountPaise: 150000,
      serviceExecutionId: testExecutionId,
      description: 'Hold for Doctor Home Visit',
    });

    expect(holdRes.wallet.balancePaise).toBe(startingBalance - 150000);

    // 2. Settle hold
    const settleTx = await billingService.settleHold(testExecutionId);
    expect(settleTx.type).toBe('DEBIT');
    expect(settleTx.amountPaise).toBe(150000);
  });

  it('should generate monthly invoice rollup calculation', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const invoice = await billingService.generateMonthlyInvoiceRollup(household!.id, '2026-08');

    expect(invoice.householdId).toBe(household!.id);
    expect(invoice.currency).toBe('INR');
    expect(invoice.totalPaise).toBeGreaterThan(0);
  });
});
