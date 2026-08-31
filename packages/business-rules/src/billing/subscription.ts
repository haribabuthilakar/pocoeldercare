import { addMonths, addYears } from 'date-fns';

export interface ExistingQuotaAllocation {
  serviceCatalogId: string;
  allocatedUnits: number;
  usedUnits: number;
}

export interface PackageBaselineQuota {
  serviceCatalogId: string;
  monthlyUnits: number;
}

export interface RolledOverQuota {
  serviceCatalogId: string;
  allocatedUnits: number;
  usedUnits: number;
  periodStart: Date;
  periodEnd: Date;
  forfeitedUnits: number;
}

export interface SubscriptionRolloverResult {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  resetQuotas: RolledOverQuota[];
  totalForfeitedUnits: number;
}

/**
 * Pure function evaluating subscription billing cycle rollover per D-57.
 * Enforces strict "Use-It-or-Lose-It" reset: unused units from previous period are forfeited,
 * and quotas reset cleanly to the baseline package version allocation for the new period.
 */
export function evaluateSubscriptionRollover(
  currentPeriodEnd: Date,
  billingCycle: 'MONTHLY' | 'YEARLY',
  existingQuotas: ExistingQuotaAllocation[],
  baselinePackageQuotas: PackageBaselineQuota[]
): SubscriptionRolloverResult {
  const nextPeriodStart = new Date(currentPeriodEnd);
  const nextPeriodEnd =
    billingCycle === 'YEARLY'
      ? addYears(nextPeriodStart, 1)
      : addMonths(nextPeriodStart, 1);

  const existingQuotaMap = new Map<string, ExistingQuotaAllocation>(
    existingQuotas.map((q) => [q.serviceCatalogId, q])
  );

  let totalForfeitedUnits = 0;
  const resetQuotas: RolledOverQuota[] = [];

  for (const baseline of baselinePackageQuotas) {
    const existing = existingQuotaMap.get(baseline.serviceCatalogId);
    const unusedUnits = existing ? Math.max(0, existing.allocatedUnits - existing.usedUnits) : 0;
    totalForfeitedUnits += unusedUnits;

    // Multiply baseline for yearly if needed (monthly baseline * 12 for yearly cycle)
    const multiplier = billingCycle === 'YEARLY' ? 12 : 1;
    const newAllocated = baseline.monthlyUnits * multiplier;

    resetQuotas.push({
      serviceCatalogId: baseline.serviceCatalogId,
      allocatedUnits: newAllocated,
      usedUnits: 0,
      periodStart: nextPeriodStart,
      periodEnd: nextPeriodEnd,
      forfeitedUnits: unusedUnits
    });
  }

  return {
    nextPeriodStart,
    nextPeriodEnd,
    resetQuotas,
    totalForfeitedUnits
  };
}
