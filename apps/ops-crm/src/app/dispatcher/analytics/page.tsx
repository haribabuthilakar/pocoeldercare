'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, Download, ArrowLeft, HeartPulse, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const mockReports = [
  {
    incidentId: 'INC-2026-8799',
    seniorName: 'Gopalakrishnan Menon',
    date: '2026-08-21',
    pickupTimeSec: 4.2,
    iceLookupSec: 1.1,
    ambulanceArrivalMin: 11.4,
    slaCompliant: true,
    outcome: 'RESOLVED_AT_HOME',
  },
  {
    incidentId: 'INC-2026-8795',
    seniorName: 'Kalyani Raghavan',
    date: '2026-08-19',
    pickupTimeSec: 5.8,
    iceLookupSec: 1.3,
    ambulanceArrivalMin: 13.8,
    slaCompliant: true,
    outcome: 'HOSPITALIZED_AND_ADMITTED',
  },
  {
    incidentId: 'INC-2026-8790',
    seniorName: 'Venkataraman Swaminathan',
    date: '2026-08-18',
    pickupTimeSec: 3.9,
    iceLookupSec: 0.9,
    ambulanceArrivalMin: 10.2,
    slaCompliant: true,
    outcome: 'RESOLVED_AT_HOME',
  },
  {
    incidentId: 'INC-2026-8782',
    seniorName: 'Anasuya Rao',
    date: '2026-08-16',
    pickupTimeSec: 12.1,
    iceLookupSec: 1.8,
    ambulanceArrivalMin: 16.5,
    slaCompliant: false,
    outcome: 'SPECIALIST_TRANSFER',
  },
];

export default function DispatcherAnalyticsPage() {
  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,IncidentId,SeniorName,Date,PickupSec,IceSec,ArrivalMin,Compliant,Outcome\n' +
      mockReports.map(r => `${r.incidentId},${r.seniorName},${r.date},${r.pickupTimeSec},${r.iceLookupSec},${r.ambulanceArrivalMin},${r.slaCompliant},${r.outcome}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Pococare_Emergency_SLA_Rollup.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dispatcher"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Command Centre</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Emergency Response SLA Performance & Incident Audit Rollup
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Weekly compliance audits • Golden Hour response benchmarks • Family incident post-mortems
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Download size={15} />
          <span>Export SLA Audit (CSV)</span>
        </button>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Golden Hour &lt;15m Rate
          </span>
          <strong className="text-2xl font-black text-brand-600 font-mono">96.8%</strong>
          <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
            <TrendingUp size={12} className="text-brand-600" />
            +2.1% from last month
          </span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Avg ICE Retrieval Latency
          </span>
          <strong className="text-2xl font-black text-slate-900 font-mono">1.18s</strong>
          <span className="text-[11px] text-brand-700 font-bold block">✓ Under 2.0s SLA</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Avg Call Pickup Time
          </span>
          <strong className="text-2xl font-black text-slate-900 font-mono">4.6s</strong>
          <span className="text-[11px] text-brand-700 font-bold block">✓ Under 10.0s Target</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Total Incidents Closed
          </span>
          <strong className="text-2xl font-black text-secondary-600 font-mono">142</strong>
          <span className="text-[11px] text-slate-500 font-bold block">100% Outcome Logged</span>
        </div>
      </div>

      {/* Incident Post-Mortem Audit Table */}
      <div className="bento-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 m-0">Recent Emergency Incident Log</h3>
          <span className="text-xs text-slate-500 font-mono">Showing last 4 emergency records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Incident</th>
                <th className="py-3 px-4">Senior Patient</th>
                <th className="py-3 px-4 font-mono">CTI Pickup</th>
                <th className="py-3 px-4 font-mono">ICE Pull</th>
                <th className="py-3 px-4 font-mono">Arrival Time</th>
                <th className="py-3 px-4">SLA Compliance</th>
                <th className="py-3 px-4">Resolution Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockReports.map((r) => (
                <tr key={r.incidentId} className="hover:bg-slate-50/80 transition-colors font-medium">
                  <td className="py-4 px-5 font-mono font-bold text-slate-900">{r.incidentId}</td>
                  <td className="py-4 px-4 font-bold text-slate-800">{r.seniorName}</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{r.pickupTimeSec}s</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{r.iceLookupSec}s</td>
                  <td className="py-4 px-4 font-mono text-brand-700 font-bold">{r.ambulanceArrivalMin} mins</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      r.slaCompliant ? 'bg-brand-50 text-brand-700' : 'bg-secondary-50 text-secondary-700'
                    }`}>
                      {r.slaCompliant ? '✓ Within SLA' : '✕ Breached'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
