'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  AlertOctagon,
  Clock,
  Users,
  Layers,
  UserPlus,
  CreditCard,
  Database,
  Activity,
  Shield,
} from 'lucide-react';
import { Badge, Avatar, AvatarFallback, cn } from '@poco/ui';
import { UserRole } from '@poco/constants';
import { AdminProviders, useStaffUser, StaffUser } from './providers';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export const ADMIN_NAVIGATION: NavItem[] = [
  // Operations Executive / Ops Manager
  {
    label: 'Pending Triage',
    href: '/admin/triage',
    icon: Inbox,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Rollup Exceptions',
    href: '/admin/exceptions',
    icon: AlertOctagon,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  {
    label: 'SLA At Risk',
    href: '/admin/sla-risk',
    icon: Clock,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  // Care Officer Manager
  {
    label: 'Care Officers Roster',
    href: '/admin/care-officers',
    icon: Users,
    roles: [UserRole.CARE_MANAGER, UserRole.SUPER_ADMIN],
  },
  // Service Catalog & Packages
  {
    label: 'Service Catalog',
    href: '/admin/catalog',
    icon: Layers,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  // Sales & Leads
  {
    label: 'Lead Pipeline',
    href: '/admin/leads',
    icon: UserPlus,
    roles: [UserRole.SALES_LEAD, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  // Finance & Billing
  {
    label: 'Billing & Overdrafts',
    href: '/admin/billing',
    icon: CreditCard,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
  // Diagnostics & Raw DB
  {
    label: 'Database Explorer',
    href: '/admin/database',
    icon: Database,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    label: 'Partner Integrations',
    href: '/admin/integrations',
    icon: Activity,
    roles: [UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN],
  },
];

export function AdminShellView({
  children,
  userOverride,
}: {
  children: React.ReactNode;
  userOverride?: StaffUser;
}) {
  const pathname = usePathname() || '/admin/triage';
  const { user: contextUser } = useStaffUser();
  const currentUser = userOverride || contextUser;

  // Compute allowed navigation items across union of all assigned roles
  const allowedNav = ADMIN_NAVIGATION.filter((item) =>
    item.roles.some((role) => currentUser.roles.includes(role))
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <aside
        data-testid="admin-sidebar"
        className="w-64 border-r border-slate-800 bg-[#0F172A] text-slate-200 flex flex-col shrink-0"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#12C395] flex items-center justify-center text-slate-950 font-bold">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white tracking-tight">Poco Elder Care</span>
            <span className="text-[10px] text-slate-400 font-medium">Operations Command</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors select-none',
                  isActive
                    ? 'bg-[#12C395] text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Profile Card */}
        <div className="p-4 border-t border-slate-800 flex items-center space-x-3 bg-slate-950/40">
          <Avatar size="sm">
            <AvatarFallback className="bg-slate-800 text-slate-200 text-xs font-bold">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ST'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate" data-testid="user-name">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Surface */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar with Role Chips */}
        <header
          data-testid="admin-header"
          className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Roles:</span>
            </span>
            <div className="flex flex-wrap gap-1.5" data-testid="role-badges">
              {currentUser.roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="text-[11px] font-semibold py-0.5 px-2 bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {role.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#12C395] animate-pulse" />
              <span className="font-medium text-[11px]">System Live (5s Polling)</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <AdminShellView>{children}</AdminShellView>
    </AdminProviders>
  );
}
