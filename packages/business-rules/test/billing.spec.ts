import { describe, it, expect } from 'vitest';
import {
  evaluateBillingAction,
  calculateGst,
  calculateWalletDebit,
  formatInr,
  calculateWalletHold,
  calculateHoldSettlement,
  evaluateSubscriptionRollover
} from '../src';
import { assertSuccess, assertFailure } from '../src/testing';

describe('Billing Hierarchy & Financial Math (BILL-01, BILL-03, BILL-04, BILL-05)', () => {
  describe('3-Step Billing Hierarchy Evaluator', () => {
    it('Step 1: Auto-debits subscription quota when quota units > 0', () => {
      const decision = evaluateBillingAction({
        serviceBasePricePaise: 40000, // ₹400
        availableQuotaUnits: 2,
        walletCurrentBalancePaise: 10000,
        isEmergency: false
      });

      expect(decision.action).toBe('AUTO_DEBIT_QUOTA');
      expect(decision.quotaUnitsDeducted).toBe(1);
      expect(decision.walletDebitPaise).toBe(0);
      expect(decision.approvalRequired).toBe(false);
    });

    it('Step 2: Allows emergency negative balance overdraft when quota is exhausted', () => {
      const decision = evaluateBillingAction({
        serviceBasePricePaise: 150000, // ₹1,500 + 18% GST = ₹1,770 (177000 paise)
        availableQuotaUnits: 0,
        walletCurrentBalancePaise: 50000, // ₹500 available
        isEmergency: true
      });

      expect(decision.action).toBe('EMERGENCY_NEGATIVE_DEBIT');
      expect(decision.totalAmountPaise).toBe(177000);
      expect(decision.walletDebitPaise).toBe(177000);
      expect(decision.remainingWalletBalancePaise).toBe(-127000); // Overdrawn
      expect(decision.requiresEmergencyOverdraft).toBe(true);
      expect(decision.approvalRequired).toBe(false);
    });

    it('Step 3: Auto-debits wallet when funds are sufficient for non-emergency', () => {
      const decision = evaluateBillingAction({
        serviceBasePricePaise: 40000, // ₹400 + 18% GST = ₹472 (47200 paise)
        availableQuotaUnits: 0,
        walletCurrentBalancePaise: 100000, // ₹1,000 available
        isEmergency: false
      });

      expect(decision.action).toBe('AUTO_DEBIT_WALLET');
      expect(decision.totalAmountPaise).toBe(47200);
      expect(decision.walletDebitPaise).toBe(47200);
      expect(decision.remainingWalletBalancePaise).toBe(52800);
      expect(decision.approvalRequired).toBe(false);
    });

    it('Step 4: Requires family pre-approval when wallet balance is insufficient', () => {
      const decision = evaluateBillingAction({
        serviceBasePricePaise: 100000, // ₹1,000 + 18% GST = ₹1,180 (118000 paise)
        availableQuotaUnits: 0,
        walletCurrentBalancePaise: 20000, // ₹200 available (shortfall ₹980)
        isEmergency: false
      });

      expect(decision.action).toBe('REQUIRE_FAMILY_APPROVAL');
      expect(decision.totalAmountPaise).toBe(118000);
      expect(decision.walletDebitPaise).toBe(0); // Not debited yet
      expect(decision.approvalRequired).toBe(true);
    });
  });

  describe('Integer Currency & GST Mathematics', () => {
    it('calculates 18% GST with deterministic half-up rounding', () => {
      const gst1 = calculateGst(10000); // ₹100 -> ₹18 GST
      expect(gst1.gstPaise).toBe(1800);
      expect(gst1.totalPaise).toBe(11800);

      const gst2 = calculateGst(333); // 333 * 0.18 = 59.94 -> rounds to 60 paise
      expect(gst2.gstPaise).toBe(60);
      expect(gst2.totalPaise).toBe(393);
    });

    it('formats paise to INR currency strings with Indian grouping', () => {
      expect(formatInr(1250050)).toBe('₹12,500.50');
      expect(formatInr(50000)).toBe('₹500.00');
      expect(formatInr(99)).toBe('₹0.99');
      expect(formatInr(-25000)).toBe('-₹250.00');
    });

    it('calculates wallet debits and detects insufficient funds', () => {
      const validDebit = calculateWalletDebit(50000, 20000);
      const res = assertSuccess(validDebit);
      expect(res.newBalancePaise).toBe(30000);

      const failedDebit = calculateWalletDebit(10000, 20000, 0, false);
      assertFailure(failedDebit);
    });
  });

  describe('Wallet Holds & Settlements', () => {
    it('places hold within available funds', () => {
      const hold = assertSuccess(calculateWalletHold(100000, 40000));
      expect(hold.holdAmountPaise).toBe(40000);
      expect(hold.remainingAvailablePaise).toBe(60000);
    });

    it('settles hold and refunds unused portion', () => {
      const settlement = calculateHoldSettlement(50000, 35000);
      expect(settlement.debitPaise).toBe(35000);
      expect(settlement.refundPaise).toBe(15000);
      expect(settlement.additionalDebitPaise).toBe(0);
    });
  });

  describe('Subscription Quota Rollovers', () => {
    it('enforces Use-It-or-Lose-It and forfeits unused quota units', () => {
      const rollover = evaluateSubscriptionRollover(
        new Date('2026-06-30T23:59:59Z'),
        'MONTHLY',
        [{ serviceCatalogId: 'service-1', allocatedUnits: 4, usedUnits: 1 }],
        [{ serviceCatalogId: 'service-1', monthlyUnits: 4 }]
      );

      expect(rollover.totalForfeitedUnits).toBe(3); // 4 - 1 = 3 unused units forfeited
      expect(rollover.resetQuotas[0].allocatedUnits).toBe(4);
      expect(rollover.resetQuotas[0].usedUnits).toBe(0);
    });
  });
});
