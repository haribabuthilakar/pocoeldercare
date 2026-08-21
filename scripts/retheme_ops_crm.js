const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. GLOBALS.CSS & TAILWIND CONFIG
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/globals.css', `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #12C395;
  --secondary: #FE1D8F;
  --background: #f8fbfb;
  --foreground: #0b0f19;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
}

.glow-primary {
  box-shadow: 0 4px 20px -2px rgba(18, 195, 149, 0.35);
}

.glow-secondary {
  box-shadow: 0 4px 20px -2px rgba(254, 29, 143, 0.35);
}

.glow-dual {
  box-shadow: 0 8px 30px -4px rgba(18, 195, 149, 0.25), 0 4px 20px -2px rgba(254, 29, 143, 0.2);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.gradient-text {
  background: linear-gradient(135deg, #12C395 0%, #FE1D8F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`);

writeFile('apps/ops-crm/tailwind.config.ts', `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edfaf5',
          100: '#d4f4ea',
          200: '#aee8d7',
          300: '#77d7be',
          400: '#3ec0a2',
          500: '#12C395', // Primary Color
          600: '#0ba17a',
          700: '#0c8063',
          800: '#0e6651',
          900: '#0e5443',
        },
        secondary: {
          50: '#fef1f8',
          100: '#fee5f2',
          200: '#fecee6',
          300: '#fda6d2',
          400: '#fb6eb6',
          500: '#FE1D8F', // Secondary Color
          600: '#e40974',
          700: '#bf035b',
          800: '#9e064c',
          900: '#830a43',
        },
        navy: {
          800: '#151b28',
          900: '#0b0f19',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
`);

writeFile('apps/ops-crm/src/app/layout.tsx', `'use client';

import './globals.css';
import React from 'react';
import { OpsHeader } from '../components/layout/ops-header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Pococare Operations CRM & Admin Hub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f8fbfb] text-slate-800 flex flex-col font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
        <OpsHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
`);

// -------------------------------------------------------------
// 2. OPS HEADER IN LIGHT FAMILY PORTAL STYLE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/ops-header.tsx', `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, ShieldAlert, FileCode2, Wallet } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & City Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center font-black text-xl text-white shadow-lg glow-dual">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Pococare</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  OPS HUB
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block -mt-0.5">Multi-City Operations Engine</span>
            </div>
          </Link>

          {/* Multi-City Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi-NCR'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={\`px-3 py-1 text-xs font-bold rounded-lg transition-all \${
                  selectedCity === city
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }\`}
              >
                <Icon size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
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
// 3. LIVE COMMAND DASHBOARD (LIGHT THEME)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/page.tsx', `'use client';

import React from 'react';
import { LiveRequestTable } from '../components/dashboard/live-request-table';
import { ShieldCheck, Activity, Users, Clock, AlertCircle } from 'lucide-react';

export default function OpsCommandPage() {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
            Active Requests
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">42</span>
            <span className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              +6 this hour
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
            SLA Compliance
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-brand-600">98.4%</span>
            <span className="text-xs text-slate-500 font-medium">Target 98.0%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
            On-Ground Officers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">18 Active</span>
            <span className="text-xs text-slate-500 font-semibold">Caseload: 26/35</span>
          </div>
        </div>

        <div className="bg-white border border-secondary-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-secondary-50/30">
          <span className="text-xs text-secondary-600 font-bold uppercase tracking-wider block mb-1">
            Clinical Escalations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-secondary-600">2 Urgent</span>
            <span className="text-xs text-secondary-700 font-bold bg-secondary-100 px-2 py-0.5 rounded-full">
              Doctor Notified
            </span>
          </div>
        </div>
      </div>

      {/* Live Table */}
      <LiveRequestTable />
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/dashboard/live-request-table.tsx', `'use client';

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
    elapsedSec: 120,
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
    elapsedSec: 2100,
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
    <div className="space-y-4">
      {/* Category Filter & Live Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'EMERGENCY', 'HOME_VISIT', 'TELECONSULT', 'DIAGNOSTICS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5 text-brand-600">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            Live Dispatch Telemetry
          </span>
          {auditLogs.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 text-[11px] font-extrabold">
              {auditLogs.length} Audit Overrides Logged
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Household & Senior</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Service Required</th>
              <th className="py-3.5 px-4">SLA Countdown</th>
              <th className="py-3.5 px-4">Assigned Personnel</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
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
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 block">{req.householdName}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{req.seniorName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
                      {req.city}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 \${
                        req.serviceCategory === 'EMERGENCY'
                          ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }\`}
                    >
                      {req.serviceCategory}
                    </span>
                    <span className="block font-bold text-slate-800">{req.serviceName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-extrabold \${
                        isBreached
                          ? 'bg-secondary-50 text-secondary-600 border border-secondary-200 animate-pulse'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }\`}
                    >
                      <Clock size={12} />
                      <span>{isBreached ? \`+\${formatTime(remainingSec)} (BREACH)\` : formatTime(remainingSec)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {req.assignedOfficerName ? (
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        {req.assignedOfficerName}
                      </span>
                    ) : (
                      <span className="text-secondary-600 font-extrabold">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveModalRequest(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold transition-all shadow-sm glow-primary"
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

// -------------------------------------------------------------
// 4. AUTO ASSIGN MODAL (LIGHT THEME)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/assignment/auto-assign-modal.tsx', `'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldAlert, ArrowRight, X, Sparkles, Check } from 'lucide-react';

interface CandidateOfficer {
  id: string;
  name: string;
  phone: string;
  score: number;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-100"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0">Intelligent Auto-Assignment</h3>
            <p className="text-xs text-slate-500 m-0">
              {householdName} • <strong className="text-slate-800">{serviceName}</strong>
            </p>
          </div>
        </div>

        {/* Candidates */}
        <div className="space-y-3 mb-5">
          {mockCandidates.map((cand) => {
            const isSelected = selectedOfficerId === cand.id;
            const isTop = cand.id === topCandidate.id;
            return (
              <div
                key={cand.id}
                onClick={() => setSelectedOfficerId(cand.id)}
                className={\`p-4 rounded-2xl border cursor-pointer transition-all \${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-500 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{cand.name}</span>
                    {isTop && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        AI Top Match
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600">{cand.score}/100</span>
                    <span className="block text-[10px] text-slate-500 font-semibold">Match Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60 font-medium">
                  <div>📍 {cand.proximityKm} km away</div>
                  <div>👥 {cand.currentCaseload}/{cand.maxCaseload} Families</div>
                  <div>⭐ {cand.rating} Rating</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Override Prompt */}
        {isManualOverride && (
          <div className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 mb-5">
            <div className="flex items-center gap-2 mb-2 text-secondary-700">
              <ShieldAlert size={16} />
              <span className="text-xs font-black uppercase tracking-wider">
                Mandatory Override Justification (OPS-07)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Override Reason Category
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="FAMILY_PREFERENCE">Family Requested Specific Officer</option>
                  <option value="TRAFFIC_PROXIMITY_ANOMALY">Local Traffic / Route Bottleneck</option>
                  <option value="SPECIALIZED_CLINICAL_SKILL">Specialized Clinical / Language Need</option>
                  <option value="OFFICER_EMERGENCY_REASSIGNMENT">Shift Overrun / Emergency Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Manager Justification Notes
                </label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Provide context for audit log..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
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
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="flex-1.5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md glow-primary"
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

// -------------------------------------------------------------
// 5. 360 CRM TIMELINE & ICE DRAWER (LIGHT THEME)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/households/[id]/page.tsx', `'use client';

import React, { useState } from 'react';
import { TimelineFeed } from '../../../components/households/timeline-feed';
import { IceQuickDrawer } from '../../../components/households/ice-quick-drawer';
import { ShieldAlert, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const [showIceDrawer, setShowIceDrawer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={14} />
          <span>Back to Live Command</span>
        </Link>

        <button
          onClick={() => setShowIceDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-extrabold shadow-sm glow-secondary transition-all"
        >
          <ShieldAlert size={16} />
          <span>1-Click Senior ICE Emergency Sheet</span>
        </button>
      </div>

      {/* Household Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 m-0">Menon Household</h2>
              <span className="px-3 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-extrabold">
                Sampoorna Plan (Active)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 flex items-center gap-1.5 font-medium">
              <MapPin size={13} className="text-brand-600" />
              #402, 12th Main, HAL 2nd Stage, Indiranagar, Bangalore 560038
            </p>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Officer</span>
              <span className="text-sm font-black text-slate-900">Ramesh Kumar</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Wallet Balance</span>
              <span className="text-sm font-black text-brand-600">₹14,500.00</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block font-semibold">Senior Resident:</span>
            <strong className="text-slate-900">Gopalakrishnan Menon (79 yrs)</strong>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Primary Emergency Sponsor:</span>
            <strong className="text-slate-900">Divya Menon (Daughter • California, USA)</strong>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Preferred Trauma Center:</span>
            <strong className="text-slate-900">Manipal Hospital Old Airport Rd (1.8 km)</strong>
          </div>
        </div>
      </div>

      {/* 360 Timeline Feed */}
      <TimelineFeed />

      {/* ICE Drawer Modal */}
      {showIceDrawer && (
        <IceQuickDrawer
          onClose={() => setShowIceDrawer(false)}
          seniorName="Gopalakrishnan Menon"
          age={79}
          bloodGroup="O+ Positive"
          conditions={['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis']}
          allergies={['Penicillin / Amoxicillin', 'Sulfa Drugs']}
          preferredHospital="Manipal Hospital Old Airport Rd"
          erPhone="+91 80 2502 4444"
          nriContact={{
            name: 'Divya Menon',
            relation: 'Daughter (NRI)',
            phone: '+1 408 555 0192',
            timezone: 'PST (UTC-8)',
          }}
          localNeighborContact={{
            name: 'Col. K. R. Sharma (Retd.)',
            phone: '+91 98450 77112',
          }}
        />
      )}
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/households/ice-quick-drawer.tsx', `'use client';

import React from 'react';
import { ShieldAlert, X, Phone, Heart, Hospital, AlertOctagon } from 'lucide-react';

interface IceQuickDrawerProps {
  onClose: () => void;
  seniorName: string;
  age: number;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  preferredHospital: string;
  erPhone: string;
  nriContact: { name: string; relation: string; phone: string; timezone: string };
  localNeighborContact: { name: string; phone: string };
}

export const IceQuickDrawer: React.FC<IceQuickDrawerProps> = ({
  onClose,
  seniorName,
  age,
  bloodGroup,
  conditions,
  allergies,
  preferredHospital,
  erPhone,
  nriContact,
  localNeighborContact,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-secondary-600">
            <ShieldAlert size={22} />
            <div>
              <h3 className="text-base font-black text-slate-900 m-0">Verified Senior ICE Emergency Sheet</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sub-2s Query Encrypted Store</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Vital Snapshot */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 m-0">{seniorName}</h4>
              <span className="text-xs text-slate-500 font-medium">Age: {age} • Blood Group: <strong className="text-brand-600">{bloodGroup}</strong></span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-black">
              ICE ACTIVE
            </span>
          </div>
        </div>

        {/* Chronic Conditions & Allergies */}
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
              Chronic Medical Conditions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c, i) => (
                <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-secondary-50 border border-secondary-200 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-secondary-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AlertOctagon size={14} />
              Known Drug Allergies & Contraindications
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a, i) => (
                <span key={i} className="text-xs font-black px-2.5 py-1 rounded-lg bg-white text-secondary-700 border border-secondary-200">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trauma Hospital */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Preferred Hospital & Trauma ER
          </span>
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <Hospital size={16} className="text-brand-600" />
            <span>{preferredHospital}</span>
          </div>
          <a
            href={\`tel:\${erPhone}\`}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline pt-1"
          >
            <Phone size={12} />
            <span>Direct ER Line: {erPhone}</span>
          </a>
        </div>

        {/* Emergency Call Trees */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Emergency Call Escalation Tree
          </span>
          
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">{nriContact.name} ({nriContact.relation})</span>
              <span className="text-[10px] text-slate-500">{nriContact.timezone} • {nriContact.phone}</span>
            </div>
            <a href={\`tel:\${nriContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-white">
              <Phone size={13} />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">{localNeighborContact.name} (Key Holder Neighbor)</span>
              <span className="text-[10px] text-slate-500">{localNeighborContact.phone}</span>
            </div>
            <a href={\`tel:\${localNeighborContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-white">
              <Phone size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/components/households/timeline-feed.tsx', `'use client';

import React from 'react';
import { PhoneCall, MapPin, Stethoscope, AlertTriangle, Wallet, Camera, Mic, CheckCircle2, Clock } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'TELEPHONY_CALL' | 'CARE_VISIT' | 'TELECONSULT' | 'INCIDENT' | 'WALLET_TOPUP';
  title: string;
  timestamp: string;
  officerOrDoctorName: string;
  summary: string;
  audioRecordingUrl?: string;
  photoProofs?: string[];
  metrics?: { [key: string]: string | number };
  status: 'COMPLETED' | 'ACTION_REQUIRED' | 'LOGGED';
}

const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    type: 'CARE_VISIT',
    title: 'In-Person Care Officer Monthly Safety & Adherence Visit',
    timestamp: 'Today at 10:30 AM',
    officerOrDoctorName: 'Ramesh Kumar (Care Officer)',
    summary: 'Completed 5-minute dynamic SOP. Pillbox refilled for 14 days, bathroom grab bars verified stable, senior cheerful.',
    photoProofs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'],
    metrics: { 'BP': '128/82 mmHg', 'SpO2': '98%', 'Pulse': '74 bpm', 'SOP Speed': '2m 45s' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-002',
    type: 'TELEPHONY_CALL',
    title: 'IVR Telephony Check-in Call (Exotel)',
    timestamp: 'Yesterday at 04:15 PM',
    officerOrDoctorName: 'Automated Elder Voice Tree',
    summary: 'Senior pressed 1 to confirm evening BP medication taken. Transcription sentiment: Positive, calm.',
    audioRecordingUrl: 'mock-audio-recording.mp3',
    status: 'COMPLETED',
  },
  {
    id: 'evt-003',
    type: 'TELECONSULT',
    title: 'Geriatric Specialist Teleconsultation (MED-04)',
    timestamp: '18 Aug 2026 at 11:00 AM',
    officerOrDoctorName: 'Dr. Arvind Swamy (Geriatrician)',
    summary: 'Reviewed quarterly HbA1c and lipid profiles. Adjusted metformin dosage, requested follow-up in 90 days.',
    metrics: { 'Prescription': 'Rx Issued (3 items)', 'Follow-up': '18 Nov 2026' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-004',
    type: 'WALLET_TOPUP',
    title: 'In-App INR Wallet Auto-Topup by NRI Daughter',
    timestamp: '15 Aug 2026 at 02:00 PM',
    officerOrDoctorName: 'Divya Menon (California, USA)',
    summary: 'Auto-replenishment of ₹10,000 for emergency dispatch holds and pay-per-use diagnostic requests.',
    metrics: { 'Amount': '+₹10,000.00', 'Balance': '₹14,500.00' },
    status: 'LOGGED',
  },
];

export const TimelineFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 m-0">360° Unified Timeline</h3>
        <span className="text-xs text-slate-500 font-semibold">Chronological Multi-Channel Ledger</span>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
        {mockEvents.map((evt) => {
          const getIcon = () => {
            switch (evt.type) {
              case 'CARE_VISIT': return <MapPin size={16} className="text-brand-600" />;
              case 'TELEPHONY_CALL': return <PhoneCall size={16} className="text-sky-600" />;
              case 'TELECONSULT': return <Stethoscope size={16} className="text-secondary-600" />;
              case 'WALLET_TOPUP': return <Wallet size={16} className="text-emerald-600" />;
              default: return <Clock size={16} className="text-slate-400" />;
            }
          };

          return (
            <div key={evt.id} className="relative group">
              {/* Pin */}
              <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-sm group-hover:border-brand-500 transition-colors">
                {getIcon()}
              </div>

              {/* Event Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 m-0">{evt.title}</h4>
                    <span className="text-xs text-slate-500 font-semibold">{evt.officerOrDoctorName}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    {evt.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed my-3 font-normal">
                  {evt.summary}
                </p>

                {/* Metrics Pill Grid */}
                {evt.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {Object.entries(evt.metrics).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">{k}</span>
                        <span className="text-xs font-black text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo Proof Gallery */}
                {evt.photoProofs && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Camera size={13} className="text-brand-600" />
                      Verified Visit Photos:
                    </span>
                    <div className="flex gap-2">
                      {evt.photoProofs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="Proof"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Recorder Link */}
                {evt.audioRecordingUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
                    <Mic size={14} className="text-sky-600" />
                    <span className="font-bold">Call Audio Recording Attached (1:12)</span>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]">
                      Play Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 6. PARTNERS DIRECTORY (LIGHT THEME)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/partners/page.tsx', `'use client';

import React, { useState } from 'react';
import { PartnerCard, PartnerProvider } from '../../components/partners/partner-card';
import { ShieldCheck, Plus } from 'lucide-react';

const mockPartners: PartnerProvider[] = [
  {
    id: 'part-001',
    name: 'Dr. Arvind Swamy (MD Geriatrics)',
    category: 'DOCTOR',
    specialization: 'Geriatric Medicine & Cognitive Health',
    city: 'Bangalore',
    phone: '+91 98450 33445',
    contractedRateINR: 1200,
    rateUnit: 'Consultation',
    isAvailable: true,
    slaMinutes: 30,
  },
  {
    id: 'part-002',
    name: 'MedPlus Advanced ALS Ambulance #14',
    category: 'AMBULANCE',
    specialization: 'Advanced Cardiac Life Support (ACLS)',
    city: 'Bangalore East',
    phone: '+91 80 6165 9999',
    contractedRateINR: 2500,
    rateUnit: 'Emergency Trip',
    isAvailable: true,
    slaMinutes: 15,
  },
  {
    id: 'part-003',
    name: 'Apollo Diagnostics Mobile Phlebotomy',
    category: 'DIAGNOSTICS',
    specialization: 'Home Fasting Blood & Urine Sample Pickup',
    city: 'Bangalore',
    phone: '+91 80 4433 2211',
    contractedRateINR: 350,
    rateUnit: 'Home Collection',
    isAvailable: true,
    slaMinutes: 60,
  },
  {
    id: 'part-004',
    name: 'Nightingales Home Care Nursing',
    category: 'HOME_NURSE',
    specialization: 'Post-Op Wound Dressing & IV Administration',
    city: 'Bangalore',
    phone: '+91 80 7788 9900',
    contractedRateINR: 800,
    rateUnit: 'Nursing Visit',
    isAvailable: false,
    slaMinutes: 120,
  },
];

export default function PartnerDirectoryPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = mockPartners.filter((p) => {
    if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Empanelled Doctor & Partner Panel</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Verified clinical specialists, ambulance fleets, and contracted rate cards</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Empanel New Partner</span>
        </button>
      </div>

      {/* Category Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'DOCTOR', 'AMBULANCE', 'DIAGNOSTICS', 'HOME_NURSE'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              selectedCat === cat
                ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/partners/partner-card.tsx', `'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';

export interface PartnerProvider {
  id: string;
  name: string;
  category: 'DOCTOR' | 'AMBULANCE' | 'DIAGNOSTICS' | 'HOME_NURSE';
  specialization: string;
  city: string;
  phone: string;
  contractedRateINR: number;
  rateUnit: string;
  isAvailable: boolean;
  slaMinutes: number;
}

export const PartnerCard: React.FC<{ partner: PartnerProvider }> = ({ partner }) => {
  const [isOnline, setIsOnline] = useState(partner.isAvailable);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {partner.category}
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-1.5 mb-0.5">{partner.name}</h3>
          <p className="text-xs text-slate-500 m-0 font-medium">{partner.specialization}</p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={\`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all \${
            isOnline
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }\`}
        >
          {isOnline ? 'Active on Shift' : 'Off-Duty'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 py-3 border-y border-slate-100 font-medium">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">City & SLA</span>
          <strong>{partner.city} • &lt;{partner.slaMinutes}m</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Contracted Rate</span>
          <strong className="text-brand-600">₹{partner.contractedRateINR} / {partner.rateUnit}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <a href={\`tel:\${partner.phone}\`} className="flex items-center gap-1.5 text-brand-600 font-extrabold hover:underline">
          <Phone size={13} />
          <span>{partner.phone}</span>
        </a>

        <span className="text-[11px] text-slate-500 font-semibold">Verified Partner</span>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 7. CATALOG EDITOR & PAYOUTS (LIGHT THEME)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/catalog/page.tsx', `'use client';

import React, { useState } from 'react';
import { SopEditorModal, SopTemplateVersion, SopStepDef } from '../../components/catalog/sop-editor-modal';
import { Plus, Edit, Check } from 'lucide-react';

const mockTemplates: SopTemplateVersion[] = [
  {
    serviceCode: 'SOP-CARE-01',
    serviceName: 'Dedicated Care Officer In-Person Visit',
    currentVersion: 'v1.1.0',
    steps: [
      { id: 'st-1', order: 1, name: 'Elder Orientation & Fall Risk Assessment', category: 'Safety', requiresPhoto: false, requiresVoice: false },
      { id: 'st-2', order: 2, name: 'Pillbox Medication Adherence & Refill Check', category: 'Clinical', requiresPhoto: true, requiresVoice: false },
      { id: 'st-3', order: 3, name: 'Bathroom Anti-Slip Mats & Grab Rail Inspection', category: 'Safety', requiresPhoto: true, requiresVoice: false },
      { id: 'st-4', order: 4, name: 'Dietary & Fluid Intake Check', category: 'Nutrition', requiresPhoto: false, requiresVoice: false },
    ],
  },
  {
    serviceCode: 'SOP-MED-03',
    serviceName: 'Doctor Home Clinical Visit (MED-03)',
    currentVersion: 'v1.0.0',
    steps: [
      { id: 'st-10', order: 1, name: 'Comprehensive Geriatric Assessment (CGA)', category: 'Clinical', requiresPhoto: false, requiresVoice: true },
      { id: 'st-11', order: 2, name: 'Physical Examination & Prescription Formulation', category: 'Clinical', requiresPhoto: true, requiresVoice: false },
    ],
  },
  {
    serviceCode: 'SOP-EMG-01',
    serviceName: '24x7 Ambulance Dispatch & Trauma Pre-Brief',
    currentVersion: 'v2.0.0',
    steps: [
      { id: 'st-20', order: 1, name: 'Sub-2s Senior ICE Profile Query & Allergy Pull', category: 'Emergency', requiresPhoto: false, requiresVoice: false },
      { id: 'st-21', order: 2, name: 'Hospital ER Trauma Bay Pre-Notification', category: 'Emergency', requiresPhoto: false, requiresVoice: false },
    ],
  },
];

export default function CatalogEditorPage() {
  const [templates, setTemplates] = useState<SopTemplateVersion[]>(mockTemplates);
  const [activeTemplate, setActiveTemplate] = useState<SopTemplateVersion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePublish = (newVer: string, updatedSteps: SopStepDef[]) => {
    if (!activeTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.serviceCode === activeTemplate.serviceCode
          ? { ...t, currentVersion: newVer, steps: updatedSteps }
          : t
      )
    );
    setToastMessage(\`Successfully published \${activeTemplate.serviceCode} \${newVer} OTA to all field apps!\`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <Check size={16} className="text-brand-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">90-Service Catalog & Dynamic SOP Editor</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Versioned OTA templates delivered instantly to Field App without app updates</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Create New SOP Template</span>
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div key={tpl.serviceCode} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {tpl.serviceCode}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1.5 mb-0.5">{tpl.serviceName}</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                {tpl.currentVersion}
              </span>
            </div>

            <div className="text-xs text-slate-600 py-2 border-y border-slate-100 space-y-1.5">
              {tpl.steps.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {idx + 1}
                  </span>
                  <span className="truncate text-slate-700 font-medium">{s.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTemplate(tpl)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-brand-700 border border-brand-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
            >
              <Edit size={13} />
              <span>Edit Protocol & Bump Version</span>
            </button>
          </div>
        ))}
      </div>

      {activeTemplate && (
        <SopEditorModal
          template={activeTemplate}
          onClose={() => setActiveTemplate(null)}
          onPublishVersion={handlePublish}
        />
      )}
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/catalog/sop-editor-modal.tsx', `'use client';

import React, { useState } from 'react';
import { FileCode2, X, Plus, Trash2, Check } from 'lucide-react';

export interface SopStepDef {
  id: string;
  order: number;
  name: string;
  category: string;
  requiresPhoto: boolean;
  requiresVoice: boolean;
}

export interface SopTemplateVersion {
  serviceCode: string;
  serviceName: string;
  currentVersion: string;
  steps: SopStepDef[];
}

export const SopEditorModal: React.FC<{
  template: SopTemplateVersion;
  onClose: () => void;
  onPublishVersion: (newVersion: string, steps: SopStepDef[]) => void;
}> = ({ template, onClose, onPublishVersion }) => {
  const [steps, setSteps] = useState<SopStepDef[]>(template.steps);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newStepName, setNewStepName] = useState('');

  const [major, minor, patch] = template.currentVersion.replace('v', '').split('.').map(Number);
  const nextMinorVersion = \`v\${major}.\${minor + 1}.0\`;

  const handleAddStep = () => {
    if (!newStepName.trim()) return;
    const newStep: SopStepDef = {
      id: \`step-\${Date.now()}\`,
      order: steps.length + 1,
      name: newStepName,
      category: 'Safety',
      requiresPhoto: true,
      requiresVoice: false,
    };
    setSteps([...steps, newStep]);
    setNewStepName('');
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onPublishVersion(nextMinorVersion, steps);
      setIsPublishing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-100">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
            <FileCode2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0">Visual Dynamic SOP Template Editor</h3>
            <p className="text-xs text-slate-500 m-0">
              {template.serviceCode} • <strong className="text-slate-800">{template.serviceName}</strong> (Current: {template.currentVersion})
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100">
            <span>Protocol Step Sequence (OTA JSON Schema)</span>
            <span>{steps.length} Steps Active</span>
          </div>

          {steps.map((step, idx) => (
            <div key={step.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900">{step.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={\`text-[10px] font-extrabold px-2 py-0.5 rounded-md border \${
                  step.requiresPhoto
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }\`}>
                  📷 Photo Proof
                </span>
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="p-1 text-slate-400 hover:text-secondary-600 rounded-md bg-white border border-slate-200"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex gap-2">
          <input
            type="text"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder="Add new SOP verification step..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
          />
          <button
            onClick={handleAddStep}
            className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Step</span>
          </button>
        </div>

        {/* Publish */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Publishing will release <strong className="text-brand-600">{nextMinorVersion}</strong> OTA to all Field Care Officers immediately.
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm glow-primary"
            >
              <span>{isPublishing ? 'Publishing...' : \`Publish \${nextMinorVersion} OTA\`}</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/payouts/page.tsx', `'use client';

import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 m-0">Partner & Doctor Payout Reconciliation</h2>
        <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Automated consumption ledger rollups, TDS deductions, and GST export statements</p>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/payouts/payout-statement-table.tsx', `'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

interface PayoutRollup {
  id: string;
  partnerName: string;
  category: string;
  billingMonth: string;
  completedUnits: number;
  unitRateINR: number;
  grossAmountINR: number;
  tdsPercent: number;
  netPayableINR: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED';
}

const initialPayouts: PayoutRollup[] = [
  {
    id: 'pay-001',
    partnerName: 'Dr. Arvind Swamy (Geriatrician)',
    category: 'DOCTOR',
    billingMonth: 'August 2026',
    completedUnits: 14,
    unitRateINR: 1200,
    grossAmountINR: 16800,
    tdsPercent: 10,
    netPayableINR: 15120,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'pay-002',
    partnerName: 'MedPlus Advanced ALS Ambulance #14',
    category: 'AMBULANCE',
    billingMonth: 'August 2026',
    completedUnits: 6,
    unitRateINR: 2500,
    grossAmountINR: 15000,
    tdsPercent: 2,
    netPayableINR: 14700,
    status: 'APPROVED',
  },
  {
    id: 'pay-003',
    partnerName: 'Apollo Diagnostics Mobile Phlebotomy',
    category: 'DIAGNOSTICS',
    billingMonth: 'August 2026',
    completedUnits: 28,
    unitRateINR: 350,
    grossAmountINR: 9800,
    tdsPercent: 2,
    netPayableINR: 9604,
    status: 'PENDING_APPROVAL',
  },
];

export const PayoutStatementTable: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRollup[]>(initialPayouts);

  const handleApproveBatch = () => {
    setPayouts((prev) => prev.map((p) => ({ ...p, status: 'APPROVED' })));
  };

  const handleExportCsv = () => {
    const headers = 'ID,Partner,Category,Month,Units,GrossINR,TDS,NetPayableINR,Status\\n';
    const rows = payouts.map(p => \`\${p.id},\${p.partnerName},\${p.category},\${p.billingMonth},\${p.completedUnits},\${p.grossAmountINR},\${p.tdsPercent}%,\${p.netPayableINR},\${p.status}\`).join('\\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`pococare-partner-payouts-aug-2026.csv\`;
    a.click();
  };

  const totalGross = payouts.reduce((acc, p) => acc + p.grossAmountINR, 0);
  const totalNet = payouts.reduce((acc, p) => acc + p.netPayableINR, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Gross Partner Consumption</span>
          <span className="text-2xl font-black text-slate-900">₹{totalGross.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Net Payable (Post-TDS)</span>
          <span className="text-2xl font-black text-brand-600">₹{totalNet.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Reconciliation Status</span>
          <span className="text-2xl font-black text-slate-900">August 2026 Rollup</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-black text-slate-900 m-0">Monthly Payout Statements</h3>

        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm"
          >
            <Download size={14} />
            <span>Download GST CSV</span>
          </button>

          <button
            onClick={handleApproveBatch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600"
          >
            <CheckCircle2 size={15} />
            <span>1-Click Batch Approve All</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Partner Provider</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Completed Volume</th>
              <th className="py-3.5 px-4">Gross (INR)</th>
              <th className="py-3.5 px-4">TDS (%)</th>
              <th className="py-3.5 px-4">Net Payable</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.partnerName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {p.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-700">{p.completedUnits} Visits/Trips</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">₹{p.grossAmountINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-slate-500">{p.tdsPercent}%</td>
                <td className="py-3.5 px-4 font-black text-brand-600">₹{p.netPayableINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={\`text-[10px] font-extrabold px-2.5 py-1 rounded-full border \${
                      p.status === 'APPROVED'
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-secondary-50 text-secondary-700 border-secondary-200'
                    }\`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`);

console.log('Finished updating Ops CRM to match Family Portal theme!');

