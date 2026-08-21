'use client';

import React from 'react';
import { DualTimezoneBadge } from './dual-timezone-badge';
import { Stethoscope, User, Video, FileText, Sparkles } from 'lucide-react';

interface AppointmentCardProps {
  title: string;
  category: 'DOCTOR_HOME_VISIT' | 'TELECONSULT' | 'CARE_OFFICER_VISIT' | 'DIAGNOSTICS';
  scheduledAt: string;
  doctorOrOfficerName: string;
  notes?: string;
  status?: string;
  viewerTimezone?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  title,
  category,
  scheduledAt,
  doctorOrOfficerName,
  notes,
  status = 'CONFIRMED',
  viewerTimezone,
}) => {
  const iconConfig = {
    DOCTOR_HOME_VISIT: { icon: Stethoscope, bg: 'bg-[#12C395]', glow: 'glow-primary' },
    TELECONSULT: { icon: Video, bg: 'bg-[#FE1D8F]', glow: 'glow-secondary' },
    CARE_OFFICER_VISIT: { icon: User, bg: 'bg-[#12C395]', glow: 'glow-primary' },
    DIAGNOSTICS: { icon: FileText, bg: 'bg-[#FE1D8F]', glow: 'glow-secondary' },
  }[category];

  const Icon = iconConfig.icon;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#12C395]/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl ${iconConfig.bg} text-white flex items-center justify-center shadow-lg ${iconConfig.glow} flex-shrink-0 mt-0.5 animate-float`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg tracking-tight">{title}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Assigned Specialist: <strong className="text-slate-800 font-bold">{doctorOrOfficerName}</strong>
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12C395] animate-ping" />
          <span>{status}</span>
        </span>
      </div>

      <div className="mt-4">
        <DualTimezoneBadge scheduledAt={scheduledAt} viewerTimezone={viewerTimezone} />
      </div>

      {notes && (
        <p className="mt-3.5 text-xs text-slate-600 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
          {notes}
        </p>
      )}
    </div>
  );
};
