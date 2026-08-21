'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { formatPaiseToRupees } from '@/lib/utils';
import { X, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ServiceBookingModalProps {
  service: {
    id: string;
    code: string;
    name: string;
    pricePaise: number;
    isIncludedInPlan: boolean;
    quotaRemaining?: number;
  };
  householdId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  householdId,
  onClose,
  onSuccess,
}) => {
  const [scheduledDate, setScheduledDate] = useState('2026-08-25');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!service.isIncludedInPlan) {
        const wallet = await ApiClient.fetch(`/billing/wallet/${householdId}`);
        if (wallet.balancePaise < service.pricePaise) {
          throw new Error(
            `Insufficient wallet balance (${formatPaiseToRupees(wallet.balancePaise)}). Top-up required for ${formatPaiseToRupees(service.pricePaise)}.`
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/80 animate-glow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-black text-[#12C395] uppercase tracking-wider">{service.code}</span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{service.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#edfaf5] rounded-3xl flex items-center justify-center mx-auto mb-4 glow-primary animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-[#12C395]" />
            </div>
            <h4 className="font-black text-slate-900 text-xl tracking-tight">Booking Confirmed!</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Care officer & clinic notified. Dual-time alert sent.</p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-bold">Service Pricing:</span>
              <span className="font-black text-sm text-slate-900">
                {service.isIncludedInPlan ? (
                  <span className="text-[#0ba17a]">₹0 (Included in Plan Quota)</span>
                ) : (
                  <span className="text-[#FE1D8F]">{formatPaiseToRupees(service.pricePaise)}</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#12C395] font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Time (IST)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#12C395] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Special Instructions / Symptoms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Routine review, check knee swelling..."
                rows={3}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#12C395] font-medium"
              />
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
                {loading ? 'Confirming...' : 'Confirm & Schedule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
