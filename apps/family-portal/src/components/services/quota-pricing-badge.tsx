'use client';

import React from 'react';
import { Check, Wallet } from 'lucide-react';
import { formatPaiseToRupees } from '@/lib/utils';

interface QuotaPricingBadgeProps {
  isIncludedInPlan: boolean;
  quotaRemaining?: number;
  pricePaise: number;
}

export const QuotaPricingBadge: React.FC<QuotaPricingBadgeProps> = ({
  isIncludedInPlan,
  quotaRemaining = 1,
  pricePaise,
}) => {
  if (isIncludedInPlan && quotaRemaining > 0) {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs">
        <Check className="w-3.5 h-3.5 text-[#12C395]" />
        <span>Included in Plan (₹0)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fee5f2] text-[#FE1D8F] border border-[#FE1D8F]/30 shadow-xs">
      <Wallet className="w-3.5 h-3.5 text-[#FE1D8F]" />
      <span>Pay-Per-Use: {formatPaiseToRupees(pricePaise)}</span>
    </span>
  );
};
