'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  UserCheck,
  Stethoscope,
  FileCode2,
  Wallet,
  ShieldAlert,
  ChevronRight,
  Headphones,
  Compass,
  Globe
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();

  const primaryNav = [
    { name: 'Live Command', href: '/', icon: Activity, badge: '2 Live', badgeColor: 'bg-secondary-50 text-secondary-600 border-secondary-200 animate-pulse' },
    { name: '24x7 Emergency Dispatch', href: '/dispatcher', icon: ShieldAlert, badge: '🚨 24x7', badgeColor: 'bg-secondary-500 text-white font-black animate-pulse' },
    { name: 'Vernacular Voice Hub', href: '/voice-tickets', icon: Headphones, badge: '4 New', badgeColor: 'bg-brand-50 text-brand-700 border-brand-200' },
    { name: 'Household 360 CRM', href: '/households/hh-blr-001', icon: Users, badge: null, badgeColor: '' },
    { name: 'Officer Fleet & Roster', href: '/officers', icon: UserCheck, badge: '18 Active', badgeColor: 'bg-brand-50 text-brand-700 border-brand-200' },
    { name: 'Partner & Doctor Panel', href: '/partners', icon: Stethoscope, badge: null, badgeColor: '' },
    { name: 'Community Stories', href: '/community', icon: Compass, badge: null, badgeColor: '' },
    { name: 'SOP & 90-Service Catalog', href: '/catalog', icon: FileCode2, badge: 'v1.2', badgeColor: 'bg-slate-100 text-slate-600' },
    { name: 'ABDM & Lab Integrations', href: '/integrations', icon: Globe, badge: 'M3 Active', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Payouts & TDS Ledger', href: '/payouts', icon: Wallet, badge: null, badgeColor: '' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center font-black text-lg text-white shadow-sm glow-dual">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">Pococare</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                OPS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">Mission Control Hub</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Command & Operations
        </div>

        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all no-underline group ${
                isActive
                  ? 'bg-brand-50/80 text-brand-800 border border-brand-200/80 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={`${
                    isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & SLA Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              SLA Engine
            </span>
            <span className="font-mono font-extrabold text-brand-600">100% On-Time</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full w-full" />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-extrabold text-xs">
              AD
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-800 block leading-tight">Admin Dispatcher</strong>
              <span className="text-[10px] text-slate-400 font-medium">Bangalore Central</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-brand-500" title="Online" />
        </div>
      </div>
    </aside>
  );
};
