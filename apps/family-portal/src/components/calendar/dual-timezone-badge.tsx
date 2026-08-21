'use client';

import React from 'react';
import { Clock, Globe } from 'lucide-react';

interface DualTimezoneBadgeProps {
  scheduledAt: string | Date;
  viewerTimezone?: string;
}

export const DualTimezoneBadge: React.FC<DualTimezoneBadgeProps> = ({
  scheduledAt,
  viewerTimezone = 'America/Los_Angeles',
}) => {
  const date = new Date(scheduledAt);

  const istString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  const viewerString = new Intl.DateTimeFormat('en-US', {
    timeZone: viewerTimezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);

  return (
    <div className="inline-flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium">
      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
        <Clock className="w-4 h-4 text-[#12C395]" />
        <span>{istString} IST (India)</span>
      </div>
      <span className="text-slate-300">•</span>
      <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
        <Globe className="w-4 h-4 text-[#FE1D8F]" />
        <span>Your Time: {viewerString}</span>
      </div>
    </div>
  );
};
