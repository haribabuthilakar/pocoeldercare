export interface EscalationTierConfig {
  tierOrder: number;
  personId: string;
  contactMethods: string[];
  delayMinutes: number;
}

export interface FamilyEscalationResult {
  activeTierOrder: number;
  notifiedPersonIds: string[];
  contactMethods: string[];
  nextTierDelayMinutes?: number;
  isMaxTierReached: boolean;
}

/**
 * Pure function evaluating the active family escalation tier based on elapsed minutes since incident trigger.
 */
export function evaluateFamilyEscalation(
  tiers: EscalationTierConfig[],
  elapsedMinutes: number
): FamilyEscalationResult {
  if (tiers.length === 0) {
    return {
      activeTierOrder: 1,
      notifiedPersonIds: [],
      contactMethods: ['SMS', 'PHONE'],
      isMaxTierReached: true
    };
  }

  // Sort tiers by tierOrder ascending
  const sortedTiers = [...tiers].sort((a, b) => a.tierOrder - b.tierOrder);

  // Find all tiers whose delayMinutes <= elapsedMinutes
  const activeTiers = sortedTiers.filter((tier) => tier.delayMinutes <= elapsedMinutes);

  if (activeTiers.length === 0) {
    // If no tier has reached delay, activate first tier
    const firstTier = sortedTiers[0]!;
    return {
      activeTierOrder: firstTier.tierOrder,
      notifiedPersonIds: [firstTier.personId],
      contactMethods: firstTier.contactMethods,
      nextTierDelayMinutes: sortedTiers[1]?.delayMinutes,
      isMaxTierReached: sortedTiers.length <= 1
    };
  }

  const currentTier = activeTiers[activeTiers.length - 1]!;
  const currentIndex = sortedTiers.findIndex((t) => t.tierOrder === currentTier.tierOrder);
  const nextTier = sortedTiers[currentIndex + 1];

  // Aggregate all persons from tier 1 up to current active tier
  const notifiedPersonIds = Array.from(new Set(activeTiers.map((t) => t.personId)));
  const contactMethods = Array.from(new Set(activeTiers.flatMap((t) => t.contactMethods)));

  return {
    activeTierOrder: currentTier.tierOrder,
    notifiedPersonIds,
    contactMethods,
    nextTierDelayMinutes: nextTier ? Math.max(0, nextTier.delayMinutes - elapsedMinutes) : undefined,
    isMaxTierReached: !nextTier
  };
}
