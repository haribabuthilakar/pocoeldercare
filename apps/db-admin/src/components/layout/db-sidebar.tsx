'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Search, ChevronRight, Layers, Table, Plus, ExternalLink } from 'lucide-react';
import { TABLE_DEFINITIONS } from '../../lib/table-schemas';
import { dbStore } from '../../lib/mock-db-store';

export const DbSidebar: React.FC = () => {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCounts(dbStore.getCounts());
    return dbStore.subscribe(() => {
      setCounts(dbStore.getCounts());
    });
  }, []);

  const tables = Object.values(TABLE_DEFINITIONS);
  const categories = Array.from(new Set(tables.map((t) => t.category)));

  const filteredTables = tables.filter((t) =>
    t.displayName.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-slate-900 flex items-center justify-center text-white shadow-xs font-black">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Pococare</span>
                <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                  CRUD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold m-0 tracking-wide">
                Database Administration Hub
              </p>
            </div>
          </Link>
        </div>

        {/* Search Tables Input */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 18 models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 placeholder-slate-400 focus:outline-brand-500"
            />
          </div>
        </div>

        {/* Tables Navigation */}
        <div className="p-3 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
          {categories.map((category) => {
            const categoryTables = filteredTables.filter((t) => t.category === category);
            if (categoryTables.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 py-1 block">
                  {category}
                </span>
                {categoryTables.map((t) => {
                  const href = `/tables/${t.name}`;
                  const isActive = pathname === href;
                  const rowCount = counts[t.name] || 0;

                  return (
                    <Link
                      key={t.name}
                      href={href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 border border-brand-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Table size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                        <span className="truncate">{t.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rowCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <a
          href="http://localhost:3003"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors no-underline"
        >
          <span className="flex items-center gap-2">
            <span>🚀 Operations CRM</span>
          </span>
          <ExternalLink size={13} className="text-slate-400" />
        </a>
      </div>
    </aside>
  );
};
