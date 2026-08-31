import type { BillingDecision, BillingEvaluationContext } from '@poco/types';
import { calculateGst } from './money';

/**
 * Pure 3-Step Billing Hierarchy Evaluator per D-50, BILL-03, BILL-04, and BILL-05.
 *
 * Evaluation Hierarchy:
 * 1. Step 1 (Quota): If active subscription has remaining quota units for service -> AUTO_DEBIT_QUOTA.
 * 2. Step 2 (Emergency): If service is an emergency or flagged as emergency -> EMERGENCY_NEGATIVE_DEBIT (allows overdraft).
 * 3. Step 3 (Wallet Balance): If household wallet has sufficient balance to cover full cost (including GST) -> AUTO_DEBIT_WALLET.
 * 4. Step 4 (Approval Required): If wallet is insufficient or service requires family pre-approval -> REQUIRE_FAMILY_APPROVAL.
 */
export function evaluateBillingAction(ctx: BillingEvaluationContext): BillingDecision {
  const gst = calculateGst(ctx.serviceBasePricePaise);
  const totalCostPaise = gst.totalPaise;

  // Step 1: Check Subscription Quota
  if (ctx.availableQuotaUnits > 0) {
    return {
      action: 'AUTO_DEBIT_QUOTA',
      baseAmountPaise: 0,
      gstPaise: 0,
      totalAmountPaise: 0,
      quotaUnitsDeducted: 1,
      walletDebitPaise: 0,
      remainingWalletBalancePaise: ctx.walletCurrentBalancePaise,
      reason: `Covered under active subscription package quota (${ctx.availableQuotaUnits} units remaining)`,
      approvalRequired: false,
      requiresEmergencyOverdraft: false
    };
  }

  // Step 2: Emergency Negative Balance Debit
  if (ctx.isEmergency) {
    const newBalance = ctx.walletCurrentBalancePaise - totalCostPaise;
    return {
      action: 'EMERGENCY_NEGATIVE_DEBIT',
      baseAmountPaise: ctx.serviceBasePricePaise,
      gstPaise: gst.gstPaise,
      totalAmountPaise: totalCostPaise,
      quotaUnitsDeducted: 0,
      walletDebitPaise: totalCostPaise,
      remainingWalletBalancePaise: newBalance,
      reason: `Emergency service executed immediately with negative wallet debit allowed per BILL-03`,
      approvalRequired: false,
      requiresEmergencyOverdraft: newBalance < 0
    };
  }

  // Step 3: Wallet Auto-Debit
  const creditLimit = ctx.creditLimitPaise ?? 0;
  const availableFunds = ctx.walletCurrentBalancePaise + creditLimit;

  if (availableFunds >= totalCostPaise) {
    const newBalance = ctx.walletCurrentBalancePaise - totalCostPaise;
    return {
      action: 'AUTO_DEBIT_WALLET',
      baseAmountPaise: ctx.serviceBasePricePaise,
      gstPaise: gst.gstPaise,
      totalAmountPaise: totalCostPaise,
      quotaUnitsDeducted: 0,
      walletDebitPaise: totalCostPaise,
      remainingWalletBalancePaise: newBalance,
      reason: `Sufficient wallet balance available. Auto-debited ${totalCostPaise} paise per BILL-04`,
      approvalRequired: false,
      requiresEmergencyOverdraft: false
    };
  }

  // Step 4: Require Family Pre-Approval & Top-Up
  const shortfallPaise = totalCostPaise - availableFunds;
  return {
    action: 'REQUIRE_FAMILY_APPROVAL',
    baseAmountPaise: ctx.serviceBasePricePaise,
    gstPaise: gst.gstPaise,
    totalAmountPaise: totalCostPaise,
    quotaUnitsDeducted: 0,
    walletDebitPaise: 0,
    remainingWalletBalancePaise: ctx.walletCurrentBalancePaise,
    reason: `Insufficient wallet balance. Shortfall of ${shortfallPaise} paise requires family approval/top-up per BILL-05`,
    approvalRequired: true,
    requiresEmergencyOverdraft: false
  };
}
