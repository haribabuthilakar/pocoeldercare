'use client';

import * as React from 'react';
import { Badge, cn } from '@poco/ui';
import { LeadStage } from '@poco/constants';
import { apiClient } from '@/lib/api-client';

export interface LeadStageDropdownProps {
  leadId: string;
  currentStage: LeadStage;
  onStageChange?: (newStage: LeadStage) => void;
  disabled?: boolean;
}

const STAGE_CONFIG: Record<
  LeadStage,
  { label: string; variant: 'secondary' | 'primary' | 'warning' | 'destructive' | 'outline' }
> = {
  [LeadStage.NEW]: { label: 'New Lead', variant: 'secondary' },
  [LeadStage.CONTACTED]: { label: 'Contacted', variant: 'outline' },
  [LeadStage.VISIT_SCHEDULED]: { label: 'Visit Scheduled', variant: 'warning' },
  [LeadStage.CONVERTED]: { label: 'Converted (CS Handoff)', variant: 'primary' },
  [LeadStage.LOST]: { label: 'Lost', variant: 'destructive' },
};

export function LeadStageDropdown({
  leadId,
  currentStage,
  onStageChange,
  disabled = false,
}: LeadStageDropdownProps) {
  const [stage, setStage] = React.useState<LeadStage>(currentStage);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    setStage(currentStage);
  }, [currentStage]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStage = e.target.value as LeadStage;
    const prevStage = stage;
    setStage(nextStage);
    setIsUpdating(true);

    try {
      await apiClient.patch(`/api/admin/v1/leads/${leadId}/stage`, {
        stage: nextStage,
        notes: `Stage transitioned from ${prevStage} to ${nextStage} via Admin Portal`,
      });
      onStageChange?.(nextStage);
    } catch (err) {
      setStage(prevStage); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  const config = STAGE_CONFIG[stage] || { label: stage, variant: 'secondary' };

  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label={`Lead stage for ${leadId}`}
        value={stage}
        disabled={disabled || isUpdating}
        onChange={handleChange}
        className={cn(
          'text-[11px] font-bold rounded-lg border py-1 pl-2 pr-6 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#12C395]',
          stage === LeadStage.CONVERTED
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : stage === LeadStage.LOST
            ? 'bg-rose-50 text-rose-800 border-rose-300'
            : stage === LeadStage.VISIT_SCHEDULED
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-slate-50 text-slate-700 border-slate-300'
        )}
      >
        {Object.entries(STAGE_CONFIG).map(([stKey, stVal]) => (
          <option key={stKey} value={stKey}>
            {stVal.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-1.5 top-2 text-[10px] text-slate-400">
        ▼
      </div>
    </div>
  );
}
