'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Table, ArrowRight, Layers, ShieldCheck, HeartPulse, Activity } from 'lucide-react';
import { TABLE_DEFINITIONS } from '../lib/table-schemas';
import { dbStore } from '../lib/mock-db-store';

export default function DbAdminOverviewPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCounts(dbStore.getCounts());
    return dbStore.subscribe(() => {
      setCounts(dbStore.getCounts());
    });
  }, []);

  const tables = Object.values(TABLE_DEFINITIONS);
  const totalRecords = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bento-card p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black uppercase tracking-wider">
            Database Administration Hub
          </span>
          <h1 className="text-xl font-black tracking-tight mt-2 m-0 text-white">
            Universal Prisma Database CRUD Explorer
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1 m-0">
            Direct Create, Read, Update, and Delete operations for all 18 models across Pococare.
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-black text-slate-300 uppercase block">Total Records</span>
            <strong className="text-xl font-black font-mono text-brand-400">{totalRecords}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
            <span className="text-[10px] font-black text-slate-300 uppercase block">Total Models</span>
            <strong className="text-xl font-black font-mono text-white">18</strong>
          </div>
        </div>
      </div>

      {/* Grid of All 18 Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tables.map((table) => {
          const rowCount = counts[table.name] || 0;

          return (
            <Link
              key={table.name}
              href={`/tables/${table.name}`}
              className="bento-card p-5 space-y-3 hover:border-brand-400 transition-all hover:shadow-md no-underline group block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 flex items-center justify-center font-black transition-colors shadow-xs">
                    <Table size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-brand-700 transition-colors m-0">
                      {table.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      {table.category}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                  {rowCount} rows
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium m-0 truncate">
                {table.displayName} • {table.fields.length} schema fields
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
                <span>Manage Table</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
