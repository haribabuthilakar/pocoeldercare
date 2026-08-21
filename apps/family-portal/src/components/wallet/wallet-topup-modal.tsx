'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { formatPaiseToRupees } from '@/lib/utils';
import { X, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletTopupModalProps {
  walletId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
  walletId,
  onClose,
  onSuccess,
}) => {
  const [amountRupees, setAmountRupees] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ApiClient.fetch(`/billing/wallet/${walletId}/topup`, {
        method: 'POST',
        body: JSON.stringify({
          amountPaise: amountRupees * 100,
          paymentReference: `PG-INR-${Date.now()}`,
          description: 'Family In-App Wallet Recharge',
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/80 animate-glow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#0ba17a] text-white flex items-center justify-center font-black text-xl shadow glow-primary">
              ₹
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Add INR Wallet Balance</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleTopup} className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountRupees(amt)}
                className={`py-3 text-xs font-black rounded-2xl border transition-all duration-300 ${
                  amountRupees === amt
                    ? 'border-[#12C395] bg-[#edfaf5] text-[#0ba17a] shadow-sm glow-primary scale-105'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Custom Amount (INR)</label>
            <input
              type="number"
              min={500}
              step={500}
              value={amountRupees}
              onChange={(e) => setAmountRupees(Number(e.target.value))}
              required
              className="w-full text-lg font-black p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#12C395]"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-500 font-medium flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#12C395] flex-shrink-0" />
            <span>Instant domestic UPI & Card gateway with zero forex surcharge</span>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-bold rounded-2xl shadow-lg glow-primary transition-all duration-300"
            >
              {loading ? 'Processing...' : `Pay ₹${amountRupees.toLocaleString('en-IN')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
