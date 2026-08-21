const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. PACKAGE CONFIGS & TAILWIND
// -------------------------------------------------------------

writeFile('apps/ops-crm/package.json', JSON.stringify({
  "name": "ops-crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3003",
    "build": "next build",
    "start": "next start -p 3003",
    "test": "vitest run"
  },
  "dependencies": {
    "@poco/types": "workspace:*",
    "clsx": "^2.1.1",
    "lucide-react": "^0.474.0",
    "next": "14.2.20",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^20.17.14",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^26.0.0",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}, null, 2));

writeFile('apps/ops-crm/tsconfig.json', JSON.stringify({
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}, null, 2));

writeFile('apps/ops-crm/tailwind.config.ts', `
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfaf5',
          100: '#d0f4e8',
          200: '#a6ebd5',
          300: '#70ddbe',
          400: '#3ac8a2',
          500: '#12C395', // Primary Mint / Emerald
          600: '#0ba17a',
          700: '#0c8063',
          800: '#0e654f',
          900: '#0f5342',
        },
        secondary: {
          50: '#fee5f2',
          100: '#fecde6',
          200: '#fea2d2',
          300: '#fe66b4',
          400: '#fe3398',
          500: '#FE1D8F', // Secondary Vivid Magenta
          600: '#e40974',
          700: '#c2045e',
          800: '#a0064e',
          900: '#850a44',
        },
        navy: {
          950: '#070a12',
          900: '#0b0f19',
          800: '#151b28',
          700: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
`);

writeFile('apps/ops-crm/vitest.config.ts', `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`);

writeFile('apps/ops-crm/src/test-setup.ts', `
import '@testing-library/jest-dom';
`);

writeFile('apps/ops-crm/src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Poppins', sans-serif;
  background-color: #0b0f19;
  color: #f8fafc;
}

.glass-panel {
  background: rgba(21, 27, 40, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card-hover {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card-hover:hover {
  transform: translateY(-2px);
  border-color: rgba(18, 195, 149, 0.4);
  box-shadow: 0 10px 30px -10px rgba(18, 195, 149, 0.2);
}
`);

writeFile('apps/ops-crm/src/app/layout.tsx', `
import './globals.css';
import type { Metadata } from 'next';
import { OpsHeader } from '../components/layout/ops-header';

export const metadata: Metadata = {
  title: 'Pococare Operations CRM & Admin Hub',
  description: 'Multi-City Real-Time Telemetry, Household CRM Timeline, Doctor Panels & SOP Publishing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans">
        <OpsHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
`);

// -------------------------------------------------------------
// 2. OPS HEADER WITH MULTI-CITY TELEMETRY
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/ops-header.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, ShieldAlert, FileCode2, Wallet, Bell, Sparkles } from 'lucide-react';

export const OpsHeader: React.FC = () => {
  const pathname = usePathname();
  const [selectedCity, setSelectedCity] = useState('Bangalore');

  const navLinks = [
    { name: 'Live Command', href: '/', icon: Activity },
    { name: 'Household CRM', href: '/households/hh-blr-001', icon: Users },
    { name: 'Doctor & Partner Panel', href: '/partners', icon: ShieldAlert },
    { name: 'SOP & Catalog Editor', href: '/catalog', icon: FileCode2 },
    { name: 'Payout Reconciliation', href: '/payouts', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & City Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-brand-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">Pococare</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  OPS HUB
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Multi-City Operations Engine</span>
            </div>
          </Link>

          {/* Multi-City Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-navy-800 p-1 rounded-xl border border-white/5">
            {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi-NCR'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={\`px-3 py-1 text-xs font-bold rounded-lg transition-all \${
                  selectedCity === city
                    ? 'bg-brand-500 text-navy-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }\`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={\`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all \${
                  isActive
                    ? 'bg-white/10 text-brand-400 border border-brand-500/30 shadow-inner'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }\`}
              >
                <Icon size={14} className={isActive ? 'text-brand-400' : 'text-slate-400'} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
`);

// -------------------------------------------------------------
// 3. MULTI-CITY LIVE COMMAND TABLE & AUTO-ASSIGN MODAL
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/assignment/auto-assign-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldAlert, ArrowRight, X, Sparkles, Check } from 'lucide-react';

interface CandidateOfficer {
  id: string;
  name: string;
  phone: string;
  score: number; // 0 - 100
  proximityKm: number;
  currentCaseload: number;
  maxCaseload: number;
  languages: string[];
  rating: number;
}

export interface OverrideAuditLog {
  id: string;
  serviceRequestId: string;
  originalOfficerId: string;
  selectedOfficerId: string;
  reasonCategory: string;
  notes: string;
  managerEmail: string;
  timestamp: string;
}

interface AutoAssignModalProps {
  serviceRequestId: string;
  householdName: string;
  serviceName: string;
  onClose: () => void;
  onConfirmAssign: (officerId: string, overrideLog?: OverrideAuditLog) => void;
}

const mockCandidates: CandidateOfficer[] = [
  {
    id: 'off-001',
    name: 'Ramesh Kumar (Top Match)',
    phone: '+91 98450 99888',
    score: 96,
    proximityKm: 2.1,
    currentCaseload: 28,
    maxCaseload: 35,
    languages: ['Kannada', 'English', 'Tamil'],
    rating: 4.9,
  },
  {
    id: 'off-002',
    name: 'Suresh Gowda',
    phone: '+91 98450 11223',
    score: 84,
    proximityKm: 4.8,
    currentCaseload: 22,
    maxCaseload: 35,
    languages: ['Kannada', 'Telugu'],
    rating: 4.7,
  },
  {
    id: 'off-003',
    name: 'Meenakshi Iyer',
    phone: '+91 98450 44556',
    score: 79,
    proximityKm: 6.2,
    currentCaseload: 31,
    maxCaseload: 35,
    languages: ['Tamil', 'Hindi', 'English'],
    rating: 4.8,
  },
];

export const AutoAssignModal: React.FC<AutoAssignModalProps> = ({
  serviceRequestId,
  householdName,
  serviceName,
  onClose,
  onConfirmAssign,
}) => {
  const topCandidate = mockCandidates[0];
  const [selectedOfficerId, setSelectedOfficerId] = useState(topCandidate.id);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideReason, setOverrideReason] = useState('FAMILY_PREFERENCE');
  const [overrideNotes, setOverrideNotes] = useState('');

  const isManualOverride = selectedOfficerId !== topCandidate.id;

  const handleAssign = () => {
    if (isManualOverride) {
      if (!overrideNotes.trim()) {
        alert('Mandatory Audit Policy: Free-text justification note is required for manual assignment overrides.');
        return;
      }
      const log: OverrideAuditLog = {
        id: \`audit-\${Date.now()}\`,
        serviceRequestId,
        originalOfficerId: topCandidate.id,
        selectedOfficerId,
        reasonCategory: overrideReason,
        notes: overrideNotes,
        managerEmail: 'ops.lead@pococare.in',
        timestamp: new Date().toISOString(),
      };
      onConfirmAssign(selectedOfficerId, log);
    } else {
      onConfirmAssign(selectedOfficerId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-900 border border-white/15 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white m-0">Intelligent Auto-Assignment</h3>
            <p className="text-xs text-slate-400 m-0">
              {householdName} • <strong className="text-white">{serviceName}</strong>
            </p>
          </div>
        </div>

        {/* Candidate List with Scoring */}
        <div className="space-y-3 mb-6">
          {mockCandidates.map((cand) => {
            const isSelected = selectedOfficerId === cand.id;
            const isTop = cand.id === topCandidate.id;
            return (
              <div
                key={cand.id}
                onClick={() => setSelectedOfficerId(cand.id)}
                className={\`p-4 rounded-2xl border cursor-pointer transition-all \${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-lg'
                    : 'bg-navy-800/60 border-white/5 text-slate-300 hover:border-white/20'
                }\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{cand.name}</span>
                    {isTop && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500 text-navy-950">
                        AI Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-400">{cand.score}/100</span>
                    <span className="block text-[10px] text-slate-400">Match Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <div>📍 {cand.proximityKm} km away</div>
                  <div>👥 {cand.currentCaseload}/{cand.maxCaseload} Families</div>
                  <div>⭐ {cand.rating} Rating</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Override Prompt if non-top candidate chosen */}
        {isManualOverride && (
          <div className="p-4 rounded-2xl bg-secondary-500/10 border border-secondary-500/30 mb-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2 text-secondary-400">
              <ShieldAlert size={16} />
              <span className="text-xs font-black uppercase tracking-wider">
                Mandatory Override Justification Required (OPS-07)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Override Reason Category
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="FAMILY_PREFERENCE">Family Requested Specific Officer</option>
                  <option value="TRAFFIC_PROXIMITY_ANOMALY">Local Traffic / Route Bottleneck</option>
                  <option value="SPECIALIZED_CLINICAL_SKILL">Specialized Clinical / Language Need</option>
                  <option value="OFFICER_EMERGENCY_REASSIGNMENT">Shift Overrun / Emergency Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Manager Justification Notes
                </label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Provide context for audit log..."
                  className="w-full bg-navy-800 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="flex-1.5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-navy-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <span>{isManualOverride ? 'Confirm Override & Log Audit' : 'Confirm Assignment'}</span>
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/components/dashboard/live-request-table.tsx', `
'use client';

import React, { useState } from 'react';
import { AutoAssignModal, OverrideAuditLog } from '../assignment/auto-assign-modal';
import { Clock, AlertTriangle, UserCheck, ShieldCheck, Search, Filter } from 'lucide-react';

interface ServiceRequest {
  id: string;
  householdName: string;
  seniorName: string;
  city: string;
  serviceCategory: 'EMERGENCY' | 'HOME_VISIT' | 'TELECONSULT' | 'DIAGNOSTICS';
  serviceName: string;
  slaTargetMin: number;
  elapsedSec: number;
  assignedOfficerName?: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}

const initialRequests: ServiceRequest[] = [
  {
    id: 'req-001',
    householdName: 'Menon Family (Indiranagar)',
    seniorName: 'Gopalakrishnan Menon (79)',
    city: 'Bangalore',
    serviceCategory: 'EMERGENCY',
    serviceName: 'SOS Emergency Response Trigger',
    slaTargetMin: 15,
    elapsedSec: 120, // 2 min
    status: 'UNASSIGNED',
  },
  {
    id: 'req-002',
    householdName: 'Raghavan Family (Whitefield)',
    seniorName: 'Kalyani Raghavan (82)',
    city: 'Bangalore',
    serviceCategory: 'HOME_VISIT',
    serviceName: 'Dedicated Care Officer Monthly Visit',
    slaTargetMin: 120,
    elapsedSec: 4200,
    assignedOfficerName: 'Ramesh Kumar',
    status: 'IN_PROGRESS',
  },
  {
    id: 'req-003',
    householdName: 'Deshmukh Household (Bandra)',
    seniorName: 'Suresh Deshmukh (81)',
    city: 'Mumbai',
    serviceCategory: 'TELECONSULT',
    serviceName: 'Geriatric Specialist Teleconsult (MED-04)',
    slaTargetMin: 30,
    elapsedSec: 2100, // 35 min (breached!)
    status: 'UNASSIGNED',
  },
  {
    id: 'req-004',
    householdName: 'Sundaram Residence (Adyar)',
    seniorName: 'Padma Sundaram (76)',
    city: 'Chennai',
    serviceCategory: 'DIAGNOSTICS',
    serviceName: 'Home Blood Sample Collection (MED-06)',
    slaTargetMin: 60,
    elapsedSec: 1500,
    assignedOfficerName: 'Kavitha R',
    status: 'ASSIGNED',
  },
];

export const LiveRequestTable: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalRequest, setActiveModalRequest] = useState<ServiceRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<OverrideAuditLog[]>([]);

  const filteredRequests = requests.filter((r) => {
    if (selectedCategory !== 'ALL' && r.serviceCategory !== selectedCategory) return false;
    return true;
  });

  const handleAssignConfirm = (officerId: string, overrideLog?: OverrideAuditLog) => {
    if (!activeModalRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeModalRequest.id
          ? { ...r, status: 'ASSIGNED', assignedOfficerName: 'Assigned Officer' }
          : r
      )
    );
    if (overrideLog) {
      setAuditLogs((prev) => [overrideLog, ...prev]);
    }
    setActiveModalRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'EMERGENCY', 'HOME_VISIT', 'TELECONSULT', 'DIAGNOSTICS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                selectedCategory === cat
                  ? 'bg-brand-500 text-navy-950 shadow-md'
                  : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5 text-brand-400">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            Live Dispatch Stream
          </span>
          {auditLogs.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-secondary-500/20 text-secondary-400 border border-secondary-500/30">
              {auditLogs.length} Audit Overrides Logged
            </span>
          )}
        </div>
      </div>

      {/* Table of Live Requests */}
      <div className="bg-navy-800/70 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-extrabold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Household & Senior</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Service Required</th>
              <th className="py-3.5 px-4">SLA Countdown</th>
              <th className="py-3.5 px-4">Assigned Personnel</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {filteredRequests.map((req) => {
              const remainingSec = req.slaTargetMin * 60 - req.elapsedSec;
              const isBreached = remainingSec <= 0;
              const formatTime = (s: number) => {
                const abs = Math.abs(s);
                const m = Math.floor(abs / 60);
                const sec = abs % 60;
                return \`\${m}m \${sec}s\`;
              };

              return (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{req.householdName}</span>
                    <span className="text-[11px] text-slate-400">{req.seniorName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-navy-900 text-slate-300 font-bold border border-white/5">
                      {req.city}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 \${
                        req.serviceCategory === 'EMERGENCY'
                          ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/40'
                          : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      }\`}
                    >
                      {req.serviceCategory}
                    </span>
                    <span className="block font-semibold text-slate-200">{req.serviceName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold \${
                        isBreached
                          ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/40 animate-pulse'
                          : 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      }\`}
                    >
                      <Clock size={12} />
                      <span>{isBreached ? \`+\${formatTime(remainingSec)} (BREACH)\` : formatTime(remainingSec)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {req.assignedOfficerName ? (
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        {req.assignedOfficerName}
                      </span>
                    ) : (
                      <span className="text-secondary-400 font-bold">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveModalRequest(req)}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-extrabold transition-all shadow-md"
                    >
                      {req.assignedOfficerName ? 'Reassign' : 'Auto-Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeModalRequest && (
        <AutoAssignModal
          serviceRequestId={activeModalRequest.id}
          householdName={activeModalRequest.householdName}
          serviceName={activeModalRequest.serviceName}
          onClose={() => setActiveModalRequest(null)}
          onConfirmAssign={handleAssignConfirm}
        />
      )}
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/page.tsx', `
import React from 'react';
import { LiveRequestTable } from '../components/dashboard/live-request-table';
import { ShieldCheck, Activity, Users, Clock, AlertCircle } from 'lucide-react';

export default function OpsCommandPage() {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Active Requests
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">42</span>
            <span className="text-xs text-brand-400 font-bold">+6 this hour</span>
          </div>
        </div>

        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
            SLA Compliance
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-400">98.4%</span>
            <span className="text-xs text-slate-400 font-medium">Target 98.0%</span>
          </div>
        </div>

        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
            On-Ground Officers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">18 Active</span>
            <span className="text-xs text-slate-400">Caseload: 26/35</span>
          </div>
        </div>

        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Clinical Escalations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-secondary-400">2 Urgent</span>
            <span className="text-xs text-secondary-400 font-bold">Doctor Notified</span>
          </div>
        </div>
      </div>

      {/* Live Table */}
      <LiveRequestTable />
    </div>
  );
}
`);

console.log('Finished generating Wave 1 Ops CRM scaffold and Live Command Dashboard');

