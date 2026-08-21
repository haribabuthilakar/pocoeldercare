const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. GLOBALS.CSS
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/globals.css', `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #12C395;
  --secondary: #FE1D8F;
  --background: #f8fafc;
  --foreground: #0f172a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Glassmorphism & Custom Elevation */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.85);
}

.glow-primary {
  box-shadow: 0 4px 20px -2px rgba(18, 195, 149, 0.3);
}

.glow-secondary {
  box-shadow: 0 4px 20px -2px rgba(254, 29, 143, 0.3);
}

.glow-dual {
  box-shadow: 0 8px 30px -4px rgba(18, 195, 149, 0.25), 0 4px 20px -2px rgba(254, 29, 143, 0.2);
}

.bento-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.bento-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`);

// -------------------------------------------------------------
// 2. COMMAND PALETTE MODAL (Ctrl+K)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/command-palette-modal.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, UserCheck, Stethoscope, FileCode2, Wallet, Activity, ArrowRight } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'HOUSEHOLD' | 'OFFICER' | 'PARTNER' | 'CATALOG' | 'PAGE';
  href: string;
}

const searchItems: SearchItem[] = [
  { id: 's1', title: 'Menon Family (Gopalakrishnan Menon, 79)', subtitle: 'Indiranagar, Bangalore East • Active Plan', category: 'HOUSEHOLD', href: '/households/hh-blr-001' },
  { id: 's2', title: 'Raghavan Family (Kalyani Raghavan, 82)', subtitle: 'Jayanagar, Bangalore South • Post-Op Rehab', category: 'HOUSEHOLD', href: '/households/hh-blr-001' },
  { id: 's3', title: 'Ramesh Kumar (Care Officer)', subtitle: 'Bangalore East • 26/35 Families • On-Duty', category: 'OFFICER', href: '/officers' },
  { id: 's4', title: 'Suresh Gowda (Care Officer)', subtitle: 'Bangalore South • 22/35 Families • On-Duty', category: 'OFFICER', href: '/officers' },
  { id: 's5', title: 'Dr. Ananya Sen, MD (Geriatrician)', subtitle: 'Contracted ₹1,200/consult • On-Duty', category: 'PARTNER', href: '/partners' },
  { id: 's6', title: 'Apollo ALS Emergency Ambulance Fleet', subtitle: 'Response <15m • All Clusters', category: 'PARTNER', href: '/partners' },
  { id: 's7', title: 'MED-03: Urgent Geriatrician Home Visit', subtitle: 'Dynamic SOP v1.0.0 • 45m SLA', category: 'CATALOG', href: '/catalog' },
  { id: 's8', title: 'CO-01: Care Officer Bi-Weekly Check-in', subtitle: 'Dynamic SOP v1.2.0 • 30m SLA', category: 'CATALOG', href: '/catalog' },
  { id: 's9', title: 'Partner Payout Ledger & GST Export', subtitle: 'Monthly TDS & Reconciliation', category: 'PAGE', href: '/payouts' },
];

export const CommandPaletteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'HOUSEHOLD':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">Household</span>;
      case 'OFFICER':
        return <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold">Officer</span>;
      case 'PARTNER':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">Partner</span>;
      case 'CATALOG':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">SOP</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">Page</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search households, officers, doctors, SOPs, tickets... (Type to filter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching records found for "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {item.category === 'HOUSEHOLD' && <Users size={14} />}
                    {item.category === 'OFFICER' && <UserCheck size={14} />}
                    {item.category === 'PARTNER' && <Stethoscope size={14} />}
                    {item.category === 'CATALOG' && <FileCode2 size={14} />}
                    {item.category === 'PAGE' && <Activity size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                        {item.title}
                      </strong>
                      {getCategoryBadge(item.category)}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium m-0">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Tip: Use arrow keys to navigate or click to jump</span>
          <span className="font-mono">Pococare Fast Navigation</span>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. SIDEBAR NAVIGATION
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/sidebar-nav.tsx', `'use client';

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
  Compass
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();

  const primaryNav = [
    { name: 'Live Command', href: '/', icon: Activity, badge: '2 Live', badgeColor: 'bg-secondary-50 text-secondary-600 border-secondary-200 animate-pulse' },
    { name: 'Household 360 CRM', href: '/households/hh-blr-001', icon: Users, badge: null, badgeColor: '' },
    { name: 'Officer Fleet & Roster', href: '/officers', icon: UserCheck, badge: '18 Active', badgeColor: 'bg-brand-50 text-brand-700 border-brand-200' },
    { name: 'Partner & Doctor Panel', href: '/partners', icon: Stethoscope, badge: null, badgeColor: '' },
    { name: 'SOP & 90-Service Catalog', href: '/catalog', icon: FileCode2, badge: 'v1.2', badgeColor: 'bg-slate-100 text-slate-600' },
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
              className={\`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all no-underline group \${
                isActive
                  ? 'bg-brand-50/80 text-brand-800 border border-brand-200/80 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }\`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={\`\${
                    isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  }\`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={\`text-[10px] font-extrabold px-2 py-0.5 rounded-full border \${item.badgeColor}\`}>
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
`);

// -------------------------------------------------------------
// 4. TOP COMMAND BAR (CITY SWITCHER & SEARCH)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/top-command-bar.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Bell, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { CommandPaletteModal } from './command-palette-modal';

export const TopCommandBar: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Quick City Switcher & Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <MapPin size={13} className="text-brand-600 ml-1.5" />
            {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi-NCR'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={\`px-2.5 py-1 text-xs font-bold rounded-lg transition-all \${
                  selectedCity === city
                    ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }\`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Clock size={13} className="text-brand-600" />
            <span>{timeString || '12:00:00 PM'} IST</span>
          </div>
        </div>

        {/* Center/Right: Quick Search Button & Notification Pill */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button triggering Command Palette */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-medium transition-all shadow-xs"
          >
            <Search size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Quick Search (Ctrl+K)...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Critical Alerts Bell */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary-500" />
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
`);

// -------------------------------------------------------------
// 5. ROOT LAYOUT WRAPPER (SIDEBAR + CONTENT)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/layout.tsx', `'use client';

import './globals.css';
import React from 'react';
import { SidebarNav } from '../components/layout/sidebar-nav';
import { TopCommandBar } from '../components/layout/top-command-bar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Pococare Operations CRM & Mission Control Hub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
        {/* Left Fixed Sidebar */}
        <SidebarNav />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopCommandBar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
`);

console.log('Finished Option 1 Part 1: Shell, Sidebar, Top Command Bar, Palette Modal, and Layout');

