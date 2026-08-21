'use client';

import React from 'react';
import Link from 'next/link';
import { Database, ShieldCheck, RefreshCw, Terminal, Layers } from 'lucide-react';

export const DbHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs border border-brand-200">
          PostgreSQL 16 • Prisma ORM
        </span>
        <span className="text-xs text-slate-400 font-medium hidden md:inline">
          Connected to: pocoeldercare?schema=public
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors no-underline"
        >
          Overview
        </Link>
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-700">18 Tables Synced</span>
      </div>
    </header>
  );
};
