'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { HeartPulse, Calendar, Layers, Wallet, Sparkles, LogOut, ShieldAlert, ChevronDown } from 'lucide-react';

export const PortalHeader: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, activeHouseholdName, setActiveHousehold } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Vitals & Health', icon: HeartPulse },
    { href: '/calendar', label: 'Dual-Time Calendar', icon: Calendar },
    { href: '/services', label: '90-Service Catalog', icon: Layers },
    { href: '/wallet', label: 'INR Wallet', icon: Wallet },
    { href: '/digest', label: 'Monthly Value Digest', icon: Sparkles },
  ];

  return (
    <header className="glass-card border-b border-slate-200/80 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Brand with Gradient Accent */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#FE1D8F] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg glow-primary group-hover:scale-105 transition-all duration-300">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">Poco<span className="text-[#12C395]">care</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#12C395]/15 to-[#FE1D8F]/15 text-[#0ba17a] border border-[#12C395]/30">
                  Family Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Uncompromising Care for Elders</p>
            </div>
          </Link>

          {/* Multi-Household Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            <span className="text-xs text-slate-500 font-semibold px-2">Household:</span>
            <div className="relative">
              <select
                value={activeHouseholdName?.includes('Bangalore') ? 'hh-blr-001' : 'hh-hyd-002'}
                onChange={(e) => {
                  if (e.target.value === 'hh-blr-001') {
                    setActiveHousehold('hh-blr-001', 'Menon Residence (Bangalore)');
                  } else {
                    setActiveHousehold('hh-hyd-002', 'Varma Villa (Hyderabad)');
                  }
                }}
                className="text-xs font-bold bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#12C395] cursor-pointer shadow-sm transition appearance-none"
              >
                <option value="hh-blr-001">Menon Residence (Bangalore)</option>
                <option value="hh-hyd-002">Varma Villa (Hyderabad)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 24x7 Helpline Indicator & User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-[#FE1D8F]/10 to-[#FE1D8F]/5 text-[#FE1D8F] border border-[#FE1D8F]/30 rounded-full text-xs font-bold shadow-sm animate-pulse-slow">
              <ShieldAlert className="w-4 h-4 text-[#FE1D8F]" />
              <span>24x7 Emergency Line Active</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 bg-white p-1.5 pl-3 pr-2 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">NRI Family</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#12C395] to-[#0ba17a] text-white flex items-center justify-center text-xs font-bold shadow">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-[#FE1D8F] hover:bg-[#FE1D8F]/10 rounded-xl transition duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white hover:brightness-105 shadow-md glow-primary transition duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-2 sm:space-x-4 -mb-px overflow-x-auto pb-2 scrollbar-none">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white animate-bounce' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
