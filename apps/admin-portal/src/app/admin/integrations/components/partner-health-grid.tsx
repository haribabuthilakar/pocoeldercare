import * as React from 'react';
import { PartnerHealthCard } from './partner-health-card';
import type { PartnerHealthItem } from '../actions';

export interface PartnerHealthGridProps {
  partners: PartnerHealthItem[];
  onConfigureMocks: (partner: PartnerHealthItem) => void;
  onTestPing: (partnerCode: string) => Promise<void>;
  pingingCode: string | null;
}

export function PartnerHealthGrid({
  partners,
  onConfigureMocks,
  onTestPing,
  pingingCode
}: PartnerHealthGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {partners.map((partner) => (
        <PartnerHealthCard
          key={partner.partnerCode}
          partner={partner}
          onConfigureMocks={onConfigureMocks}
          onTestPing={onTestPing}
          isPinging={pingingCode === partner.partnerCode}
        />
      ))}
    </div>
  );
}
