'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { WalletTopupModal } from '@/components/wallet/wallet-topup-modal';
import { TransactionLedger } from '@/components/wallet/transaction-ledger';
import { formatPaiseToRupees } from '@/lib/utils';
import { Wallet, Plus, ShieldCheck, Download, Sparkles } from 'lucide-react';

export default function WalletPage() {
  const [balancePaise, setBalancePaise] = useState(1500000); // ₹15,000
  const [showTopup, setShowTopup] = useState(false);

  const transactions = [
    { id: 'tx-1', type: 'CREDIT' as const, amountPaise: 1500000, description: 'Initial Wallet Topup (UPI)', createdAt: '2026-08-15T09:00:00.000Z' },
    { id: 'tx-2', type: 'HOLD' as const, amountPaise: 150000, description: 'Hold for Doctor Home Visit #MED-03', createdAt: '2026-08-20T11:00:00.000Z' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Wallet Balance Hero Card */}
        <div className="bg-gradient-to-br from-[#0b0f19] to-[#151b28] rounded-3xl p-8 sm:p-10 text-white shadow-2xl mb-8 relative overflow-hidden glow-dual">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#12C395]/20 to-[#FE1D8F]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-[#12C395] uppercase tracking-widest">
                  In-App Domestic INR Wallet
                </span>
                <Sparkles className="w-4 h-4 text-[#FE1D8F] animate-spin" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mt-2 tracking-tight">
                {formatPaiseToRupees(balancePaise)}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Zero forex surcharge • Instant holds for doctors, diagnostics & emergency prescriptions
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTopup(true)}
                className="px-6 py-4 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-extrabold rounded-2xl transition-all duration-300 shadow-xl glow-primary flex items-center space-x-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add INR Funds</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <TransactionLedger transactions={transactions} />

        {showTopup && (
          <WalletTopupModal
            walletId="wallet-blr-001"
            onClose={() => setShowTopup(false)}
            onSuccess={() => {
              setBalancePaise((prev) => prev + 500000);
              alert('Wallet topped up successfully!');
            }}
          />
        )}
      </main>
    </div>
  );
}
