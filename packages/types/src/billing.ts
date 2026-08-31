import type { BillingStatus, BillingTransactionType } from '@poco/constants';

/**
 * Branded or typed Integer in Paise (1 INR = 100 Paise).
 * Eliminates floating point imprecision across the platform per D-23 and D-55.
 */
export type Paise = number;

/**
 * 3-Step Billing Hierarchy Evaluator Output Actions.
 */
export type BillingActionType =
  | 'AUTO_DEBIT_QUOTA'
  | 'AUTO_DEBIT_WALLET'
  | 'REQUIRE_FAMILY_APPROVAL'
  | 'EMERGENCY_NEGATIVE_DEBIT';

/**
 * Comprehensive Billing Decision produced by @poco/business-rules.
 */
export interface BillingDecision {
  action: BillingActionType;
  baseAmountPaise: Paise;
  gstPaise: Paise;
  totalAmountPaise: Paise;
  quotaUnitsDeducted: number;
  walletDebitPaise: Paise;
  remainingWalletBalancePaise: Paise;
  reason: string;
  approvalRequired: boolean;
  requiresEmergencyOverdraft: boolean;
}

/**
 * Context payload passed to the billing hierarchy evaluator.
 */
export interface BillingEvaluationContext {
  householdId: string;
  serviceCatalogVersionId: string;
  serviceBasePricePaise: Paise;
  isEmergency: boolean;
  availableQuotaUnits: number;
  walletCurrentBalancePaise: Paise;
  creditLimitPaise?: Paise; // default 0, emergency may allow negative
}

/**
 * Immutable Wallet Transaction record contract.
 */
export interface WalletTransactionSummary {
  id: string;
  householdId: string;
  type: BillingTransactionType;
  amountPaise: Paise;
  balanceAfterPaise: Paise;
  referenceEntityType?: string;
  referenceEntityId?: string;
  description: string;
  createdAt: string;
}

/**
 * Subscription Quota Allocation record.
 */
export interface SubscriptionQuota {
  serviceCatalogVersionId: string;
  serviceName: string;
  allocatedUnits: number;
  usedUnits: number;
  remainingUnits: number;
  periodStart: string;
  periodEnd: string;
}
