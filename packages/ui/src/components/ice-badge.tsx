import * as React from 'react';
import { PhoneCall, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export interface IceBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  contactName: string;
  relationship: string;
  phone: string;
  isMasked?: boolean;
}

export function IceBadge({
  contactName,
  relationship,
  phone,
  isMasked = false,
  className,
  ...props
}: IceBadgeProps) {
  const displayPhone = isMasked
    ? phone.slice(0, 3) + '••••' + phone.slice(-3)
    : phone;

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-3 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-rose-900 shadow-xs',
        className
      )}
      {...props}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FE1D8F] text-white">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div className="text-left leading-tight">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FE1D8F]">ICE Contact</span>
          <span className="text-xs text-rose-600 font-medium">({relationship})</span>
        </div>
        <div className="text-sm font-bold text-slate-900 mt-0.5">{contactName}</div>
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline mt-0.5"
        >
          <PhoneCall className="mr-1 h-3 w-3" />
          {displayPhone}
        </a>
      </div>
    </div>
  );
}
