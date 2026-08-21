'use client';

import React from 'react';
import { formatPaiseToRupees } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Lock, RotateCcw } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'HOLD' | 'DEBIT' | 'REFUND';
  amountPaise: number;
  description: string;
  createdAt: string;
}

export const TransactionLedger: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black text-slate-900 text-base tracking-tight">Wallet Audit Ledger</h3>
        <span className="text-xs text-slate-400 font-semibold">Paise-accurate ledger</span>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((tx) => {
          const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
          return (
            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50/70 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow ${
                  tx.type === 'CREDIT' ? 'bg-[#12C395] glow-primary' :
                  tx.type === 'HOLD' ? 'bg-[#FE1D8F] glow-secondary' :
                  tx.type === 'REFUND' ? 'bg-indigo-600' : 'bg-slate-700'
                }`}>
                  {tx.type === 'CREDIT' && <ArrowDownLeft className="w-5 h-5" />}
                  {tx.type === 'HOLD' && <Lock className="w-5 h-5" />}
                  {tx.type === 'REFUND' && <RotateCcw className="w-5 h-5" />}
                  {tx.type === 'DEBIT' && <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-black ${isCredit ? 'text-[#0ba17a]' : 'text-slate-900'}`}>
                  {isCredit ? '+' : '-'}{formatPaiseToRupees(tx.amountPaise)}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">{tx.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
