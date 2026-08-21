const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

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

writeFile('apps/ops-crm/src/app/page.tsx', `'use client';

import React from 'react';
import { LiveRequestTable } from '../components/dashboard/live-request-table';

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

console.log('Finished retheme part 1');

