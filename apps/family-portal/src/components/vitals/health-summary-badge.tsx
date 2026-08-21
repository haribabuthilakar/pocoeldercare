'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, UserCheck, Sparkles, Activity } from 'lucide-react';

interface HealthSummaryBadgeProps {
  status: 'STABLE' | 'NEEDS_ATTENTION' | 'CRITICAL';
  label: string;
  doctorReviewed?: string;
}

export const HealthSummaryBadge: React.FC<HealthSummaryBadgeProps> = ({
  status,
  label,
  doctorReviewed = 'Dr. Anand Kulkarni (MD Geriatrics)',
}) => {
  const config = {
    STABLE: {
      bg: 'bg-gradient-to-r from-[#edfaf5] to-[#d4f4ea]/40',
      border: 'border-[#12C395]/40',
      text: 'text-[#0e5443]',
      badge: 'bg-[#12C395]',
      icon: CheckCircle2,
      glow: 'glow-primary',
    },
    NEEDS_ATTENTION: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-500',
      icon: AlertTriangle,
      glow: 'shadow-md',
    },
    CRITICAL: {
      bg: 'bg-gradient-to-r from-[#fee5f2] to-[#fef1f8]',
      border: 'border-[#FE1D8F]/40',
      text: 'text-[#830a43]',
      badge: 'bg-[#FE1D8F]',
      icon: AlertTriangle,
      glow: 'glow-secondary',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-3xl border ${config.border} ${config.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl ${config.badge} text-white flex items-center justify-center shadow-lg ${config.glow} animate-float`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className={`font-extrabold text-base sm:text-lg ${config.text}`}>{label}</h3>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#12C395] border border-[#12C395]/30 shadow-xs">
              Safe Range
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Geriatric telemetry monitored in real-time by Pococare Clinical Command Center
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 text-xs text-slate-700 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs self-start md:self-auto">
        <UserCheck className="w-4 h-4 text-[#12C395]" />
        <span>Reviewed by <strong className="text-slate-900 font-bold">{doctorReviewed}</strong></span>
      </div>
    </div>
  );
};
