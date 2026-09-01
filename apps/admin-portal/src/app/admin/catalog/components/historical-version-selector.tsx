'use client';

import * as React from 'react';
import { Badge } from '@poco/ui';
import { History, Users, Calendar } from 'lucide-react';

export interface ServiceVersionHistoryItem {
  id: string;
  version: number;
  pricePaise: number;
  estimatedDurationMinutes?: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  activeSubscriberCount?: number;
  requiredCertifications: string[];
}

export interface HistoricalVersionSelectorProps {
  versions: ServiceVersionHistoryItem[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}

export function HistoricalVersionSelector({
  versions,
  selectedVersionId,
  onSelectVersion,
}: HistoricalVersionSelectorProps) {
  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
          <History className="w-3.5 h-3.5 text-[#12C395]" />
          <span>Version History & Grandfathered Rates</span>
        </div>
        <select
          aria-label="Select catalog version"
          value={selectedVersionId}
          onChange={(e) => onSelectVersion(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-2 py-1 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#12C395]"
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version} — ₹{(v.pricePaise / 100).toFixed(2)} ({v.effectiveTo ? 'Historical' : 'Active'})
            </option>
          ))}
        </select>
      </div>

      {selectedVersion && (
        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 block text-[10px]">Price Card</span>
            <span className="font-bold text-slate-900">
              ₹{(selectedVersion.pricePaise / 100).toFixed(2)}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 block text-[10px]">Effective Date</span>
            <span className="font-semibold text-slate-700">
              {new Date(selectedVersion.effectiveFrom).toLocaleDateString()}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-slate-200/80">
            <span className="text-slate-400 block text-[10px]">Grandfathered Users</span>
            <span className="font-bold text-emerald-700">
              {selectedVersion.activeSubscriberCount ?? 0} households
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
