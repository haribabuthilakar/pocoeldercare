'use client';

import React, { useState } from 'react';
import { Wallet, Download, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export interface PayoutStatement {
  partnerId: string;
  partnerName: string;
  category: string;
  completedUnits: number;
  grossAmountInr: number;
  tdsPercentage: number;
  tdsAmountInr: number;
  netPayableInr: number;
  payoutStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED';
}

const mockStatements: PayoutStatement[] = [
  {
    partnerId: 'p-01',
    partnerName: 'Dr. Ananya Sen, MD',
    category: 'Doctor Consultations (10% TDS)',
    completedUnits: 14,
    grossAmountInr: 16800,
    tdsPercentage: 10,
    tdsAmountInr: 1680,
    netPayableInr: 15120,
    payoutStatus: 'PENDING_APPROVAL',
  },
  {
    partnerId: 'p-03',
    partnerName: 'Apollo ALS Emergency Ambulance Fleet',
    category: 'Contractor Transport (2% TDS)',
    completedUnits: 6,
    grossAmountInr: 15000,
    tdsPercentage: 2,
    tdsAmountInr: 300,
    netPayableInr: 14700,
    payoutStatus: 'APPROVED',
  },
  {
    partnerId: 'p-04',
    partnerName: 'Thyrocare Home Diagnostics Hub',
    category: 'Lab Sample Collection (2% TDS)',
    completedUnits: 28,
    grossAmountInr: 9800,
    tdsPercentage: 2,
    tdsAmountInr: 196,
    netPayableInr: 9604,
    payoutStatus: 'APPROVED',
  },
];

export const PayoutStatementTable: React.FC = () => {
  const [statements, setStatements] = useState<PayoutStatement[]>(mockStatements);
  const [batchApproved, setBatchApproved] = useState(false);

  const handleBatchApprove = () => {
    setStatements((prev) =>
      prev.map((s) => ({ ...s, payoutStatus: 'APPROVED' }))
    );
    setBatchApproved(true);
    setTimeout(() => setBatchApproved(false), 3000);
  };

  const handleExportGstCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Partner,Category,Units,Gross(INR),TDS(%),TDS(INR),Net(INR),Status\n' +
      statements
        .map(
          (s) =>
            `"${s.partnerName}","${s.category}",${s.completedUnits},${s.grossAmountInr},${s.tdsPercentage},${s.tdsAmountInr},${s.netPayableInr},${s.payoutStatus}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Pococare_Partner_Payout_Ledger_Aug2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm space-y-4">
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0">Monthly Partner Payout & TDS Reconciliation Ledger</h3>
            <p className="text-xs text-slate-500 m-0 font-medium">Automated TDS deduction (10% Clinical / 2% Agency) and GST CSV export</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGstCsv}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span>Export GST Reconciliation CSV</span>
          </button>

          <button
            onClick={handleBatchApprove}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-sm glow-primary transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            <span>{batchApproved ? '✓ All Approved!' : '1-Click Batch Approval'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Partner / Doctor</th>
              <th className="py-3.5 px-5">Service Category</th>
              <th className="py-3.5 px-5 text-right">Units</th>
              <th className="py-3.5 px-5 text-right">Gross (INR)</th>
              <th className="py-3.5 px-5 text-right">TDS Deduction</th>
              <th className="py-3.5 px-5 text-right">Net Payable (INR)</th>
              <th className="py-3.5 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {statements.map((s) => (
              <tr key={s.partnerId} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-5 font-black text-slate-900">{s.partnerName}</td>
                <td className="py-4 px-5 text-slate-500 font-bold">{s.category}</td>
                <td className="py-4 px-5 text-right font-bold text-slate-800">{s.completedUnits}</td>
                <td className="py-4 px-5 text-right font-extrabold text-slate-900">₹{s.grossAmountInr.toLocaleString('en-IN')}</td>
                <td className="py-4 px-5 text-right font-bold text-secondary-600">
                  -₹{s.tdsAmountInr.toLocaleString('en-IN')} ({s.tdsPercentage}%)
                </td>
                <td className="py-4 px-5 text-right font-black text-emerald-600 text-sm">
                  ₹{s.netPayableInr.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-5 text-right whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                      s.payoutStatus === 'APPROVED'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {s.payoutStatus.replace('_', ' ')}
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
