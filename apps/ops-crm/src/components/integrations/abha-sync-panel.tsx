'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, FileText, Lock, Globe } from 'lucide-react';

export interface AbhaSyncRecord {
  householdId: string;
  seniorName: string;
  abhaAddress: string;
  m1Status: 'VERIFIED' | 'PENDING' | 'FAILED';
  m2Status: 'LINKED' | 'NOT_LINKED';
  m3ConsentStatus: 'ACTIVE' | 'EXPIRED' | 'REQUIRES_REAUTH';
  lastSyncedAt: string;
  recordsCount: number;
}

const mockAbhaRecords: AbhaSyncRecord[] = [
  {
    householdId: 'hh-blr-001',
    seniorName: 'Gopalakrishnan Menon',
    abhaAddress: 'menon.g@abdm',
    m1Status: 'VERIFIED',
    m2Status: 'LINKED',
    m3ConsentStatus: 'ACTIVE',
    lastSyncedAt: 'Today at 1:15 PM',
    recordsCount: 14,
  },
  {
    householdId: 'hh-blr-002',
    seniorName: 'Kalyani Raghavan',
    abhaAddress: 'kalyani.raghavan@abdm',
    m1Status: 'VERIFIED',
    m2Status: 'LINKED',
    m3ConsentStatus: 'REQUIRES_REAUTH',
    lastSyncedAt: 'Yesterday at 6:40 PM',
    recordsCount: 8,
  },
  {
    householdId: 'hh-blr-003',
    seniorName: 'Venkataraman Swaminathan',
    abhaAddress: 'venkat.swami@abdm',
    m1Status: 'VERIFIED',
    m2Status: 'LINKED',
    m3ConsentStatus: 'ACTIVE',
    lastSyncedAt: 'Today at 10:00 AM',
    recordsCount: 22,
  },
];

export const AbhaSyncPanel: React.FC = () => {
  const [records, setRecords] = useState<AbhaSyncRecord[]>(mockAbhaRecords);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTriggerSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setRecords((prev) =>
        prev.map((r) => ({ ...r, lastSyncedAt: 'Just now' }))
      );
    }, 1200);
  };

  return (
    <div className="bento-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black shadow-xs">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 m-0">
              ABDM / ABHA National Health Account Sync
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              M1 (ABHA ID), M2 (HPR/HFR Registry), M3 (Encrypted Consent & Records)
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerSyncAll}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin text-brand-600' : ''} />
          <span>{isSyncing ? 'Syncing ABDM...' : 'Sync All Households'}</span>
        </button>
      </div>

      {/* ABDM Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Senior Patient</th>
              <th className="py-3 px-4 font-mono">ABHA Address</th>
              <th className="py-3 px-4 text-center">M1 (ID)</th>
              <th className="py-3 px-4 text-center">M2 (HPR)</th>
              <th className="py-3 px-4 text-center">M3 (Consent)</th>
              <th className="py-3 px-4 font-mono">Linked Records</th>
              <th className="py-3 px-4">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {records.map((r) => (
              <tr key={r.householdId} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{r.seniorName}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{r.abhaAddress}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                    ✓ Verified
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                    ✓ Linked
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      r.m3ConsentStatus === 'ACTIVE'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {r.m3ConsentStatus === 'ACTIVE' ? 'Active' : 'Re-Auth Required'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">{r.recordsCount} EHR Records</td>
                <td className="py-3.5 px-4 text-slate-500">{r.lastSyncedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
