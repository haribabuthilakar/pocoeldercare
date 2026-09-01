import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from '../src/modules/billing/billing.service';
import { BillingTransactionType } from '@poco/constants';

describe('3-Step Billing Engine & Wallet Ledger Integration', () => {
  let service: BillingService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      serviceRequest: { findUnique: vi.fn() },
      householdWallet: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      quotaAllocation: { update: vi.fn() },
      walletTransaction: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cbin: any) => cbin(prismaMock)),
    };
    service = new BillingService(prismaMock as any);
  });

  describe('Step 1: Package Quota Decrement (BILL-02)', () => {
    it('decrements remaining quota units with zero wallet charge', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        unitPricePaise: 50000,
        ticket: {
          priority: 'ROUTINE',
          household: {
            wallet: { id: 'w-1', balancePaise: 50000, creditLimitPaise: 0 },
            subscriptions: [
              {
                status: 'ACTIVE',
                quotaAllocations: [
                  { id: 'qa-1', serviceCatalogId: 'svc-1', allocatedUnits: 4, usedUnits: 1 },
                ],
              },
            ],
          },
        },
        serviceCatalogVersion: {
          serviceCatalogId: 'svc-1',
          serviceCatalog: { name: 'Care Visit', defaultIsEmergency: false },
        },
      });

      const res = await service.processBillingForService('sr-1');
      expect(res.success).toBe(true);
      expect(res.action).toBe('AUTO_DEBIT_QUOTA');
      expect(res.amountPaise).toBe(0);
      expect(prismaMock.quotaAllocation.update).toHaveBeenCalledWith({
        where: { id: 'qa-1' },
        data: { usedUnits: { increment: 1 } },
      });
    });
  });

  describe('Step 2 & Step 3: Wallet Debit & Emergency Overdraft (BILL-03, BILL-04)', () => {
    it('debits wallet including 18% GST when quota is exhausted', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        unitPricePaise: 100000, // ₹1000 + 18% GST = ₹1180
        ticket: {
          priority: 'ROUTINE',
          household: {
            wallet: { id: 'w-1', balancePaise: 200000, creditLimitPaise: 0 },
            subscriptions: [],
          },
        },
        serviceCatalogVersion: {
          serviceCatalogId: 'svc-1',
          serviceCatalog: { name: 'Specialist Consultation', defaultIsEmergency: false },
        },
      });

      prismaMock.walletTransaction.create.mockResolvedValue({ id: 'tx-1' });

      const res = await service.processBillingForService('sr-1');
      expect(res.success).toBe(true);
      expect(res.action).toBe('AUTO_DEBIT_WALLET');
      expect(res.amountPaise).toBe(118000);
      expect(res.balanceAfterPaise).toBe(82000);
    });

    it('allows negative overdraft for EMERGENCY services when balance is insufficient (BILL-03)', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-emergency',
        unitPricePaise: 250000, // ₹2500 + 18% GST = ₹2950
        ticket: {
          priority: 'EMERGENCY',
          household: {
            wallet: { id: 'w-1', balancePaise: 50000, creditLimitPaise: 0 }, // only ₹500
            subscriptions: [],
          },
        },
        serviceCatalogVersion: {
          serviceCatalogId: 'svc-ambulance',
          serviceCatalog: { name: 'Ambulance', defaultIsEmergency: true },
        },
      });

      prismaMock.walletTransaction.create.mockResolvedValue({ id: 'tx-emergency' });

      const res = await service.processBillingForService('sr-emergency');
      expect(res.success).toBe(true);
      expect(res.action).toBe('EMERGENCY_NEGATIVE_DEBIT');
      expect(res.balanceAfterPaise).toBeLessThan(0);
    });

    it('requires family approval for non-emergency shortfall (BILL-05)', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-1',
        unitPricePaise: 100000,
        ticket: {
          priority: 'ROUTINE',
          household: {
            wallet: { id: 'w-1', balancePaise: 10000, creditLimitPaise: 0 }, // insufficient
            subscriptions: [],
          },
        },
        serviceCatalogVersion: {
          serviceCatalogId: 'svc-1',
          serviceCatalog: { name: 'Physiotherapy', defaultIsEmergency: false },
        },
      });

      const res = await service.processBillingForService('sr-1');
      expect(res.success).toBe(false);
      expect(res.approvalRequired).toBe(true);
      expect(res.shortfallPaise).toBeGreaterThan(0);
    });
  });

  describe('Wallet Top-Up & Invoices (BILL-06, BILL-07)', () => {
    it('credits wallet from payment webhook and records audit transaction', async () => {
      prismaMock.householdWallet.findUnique.mockResolvedValue({
        id: 'w-1',
        householdId: 'hh-1',
        balancePaise: 20000,
      });

      prismaMock.walletTransaction.create.mockResolvedValue({
        id: 'tx-topup-1',
      });

      const res = await service.creditWalletFromWebhook('hh-1', 50000, 'pay_12345');
      expect(res.success).toBe(true);
      expect(res.newBalancePaise).toBe(70000);
      expect(prismaMock.householdWallet.update).toHaveBeenCalledWith({
        where: { id: 'w-1' },
        data: { balancePaise: 70000 },
      });
    });
  });
});

