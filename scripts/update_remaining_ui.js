const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Updated:', relPath);
}

// -------------------------------------------------------------
// 1. CALENDAR APPOINTMENT CARD & CALENDAR PAGE
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/calendar/appointment-card.tsx', `
import React from 'react';
import { DualTimezoneBadge } from './dual-timezone-badge';
import { Stethoscope, User, Video, FileText, Sparkles } from 'lucide-react';

interface AppointmentCardProps {
  title: string;
  category: 'DOCTOR_HOME_VISIT' | 'TELECONSULT' | 'CARE_OFFICER_VISIT' | 'DIAGNOSTICS';
  scheduledAt: string;
  doctorOrOfficerName: string;
  notes?: string;
  status?: string;
  viewerTimezone?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  title,
  category,
  scheduledAt,
  doctorOrOfficerName,
  notes,
  status = 'CONFIRMED',
  viewerTimezone,
}) => {
  const iconConfig = {
    DOCTOR_HOME_VISIT: { icon: Stethoscope, bg: 'bg-[#12C395]', glow: 'glow-primary' },
    TELECONSULT: { icon: Video, bg: 'bg-[#FE1D8F]', glow: 'glow-secondary' },
    CARE_OFFICER_VISIT: { icon: User, bg: 'bg-[#12C395]', glow: 'glow-primary' },
    DIAGNOSTICS: { icon: FileText, bg: 'bg-[#FE1D8F]', glow: 'glow-secondary' },
  }[category];

  const Icon = iconConfig.icon;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#12C395]/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className={\`w-12 h-12 rounded-2xl \${iconConfig.bg} text-white flex items-center justify-center shadow-lg \${iconConfig.glow} flex-shrink-0 mt-0.5 animate-float\`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg tracking-tight">{title}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Assigned Specialist: <strong className="text-slate-800 font-bold">{doctorOrOfficerName}</strong>
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#12C395] animate-ping" />
          <span>{status}</span>
        </span>
      </div>

      <div className="mt-4">
        <DualTimezoneBadge scheduledAt={scheduledAt} viewerTimezone={viewerTimezone} />
      </div>

      {notes && (
        <p className="mt-3.5 text-xs text-slate-600 font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
          {notes}
        </p>
      )}
    </div>
  );
};
`);

writeFile('apps/family-portal/src/app/calendar/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { AppointmentCard } from '@/components/calendar/appointment-card';
import { Globe, Plus, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [selectedTz, setSelectedTz] = useState('America/Los_Angeles');

  const appointments = [
    {
      title: 'Quarterly Geriatric Comprehensive Evaluation',
      category: 'DOCTOR_HOME_VISIT' as const,
      scheduledAt: '2026-08-25T10:30:00.000Z',
      doctorOrOfficerName: 'Dr. Anand Kulkarni (MD Geriatrics)',
      notes: 'Focus on balance stability, blood pressure medication optimization, and fall risk score.',
    },
    {
      title: 'Bi-Weekly Care Officer Health & Social Visit',
      category: 'CARE_OFFICER_VISIT' as const,
      scheduledAt: '2026-08-28T16:00:00.000Z',
      doctorOrOfficerName: 'Ramesh Kumar (Ex-AFMC)',
      notes: 'Vitals capture, pillbox medication restock check, and mobility check.',
    },
    {
      title: 'Fasting Lipid & HbA1c Sample Collection',
      category: 'DIAGNOSTICS' as const,
      scheduledAt: '2026-09-02T07:30:00.000Z',
      doctorOrOfficerName: 'Apollo Diagnostics Phlebotomist',
      notes: '12-hour fasting required prior to visit.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Header & Timezone Switcher */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dual-Timezone Family Calendar
              </h1>
              <Sparkles className="w-5 h-5 text-[#FE1D8F]" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Synchronize doctor visits and care officer check-ins between India (<strong className="text-[#12C395]">IST</strong>) and your local timezone
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-xs">
              <Globe className="w-4 h-4 text-[#12C395] ml-1.5" />
              <span className="text-xs text-slate-600 font-bold">Your Timezone:</span>
              <div className="relative">
                <select
                  value={selectedTz}
                  onChange={(e) => setSelectedTz(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-[#12C395] cursor-pointer appearance-none shadow-xs"
                >
                  <option value="America/Los_Angeles">US Pacific (PDT / UTC-7)</option>
                  <option value="America/New_York">US Eastern (EDT / UTC-4)</option>
                  <option value="Europe/London">UK (GMT / BST / UTC+1)</option>
                  <option value="Asia/Dubai">Dubai (GST / UTC+4)</option>
                  <option value="Asia/Singapore">Singapore (SGT / UTC+8)</option>
                  <option value="Asia/Kolkata">India (IST / UTC+5:30)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <Link
              href="/services"
              className="px-5 py-3 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-bold rounded-2xl transition shadow-lg glow-primary flex items-center space-x-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Visit</span>
            </Link>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map((apt, idx) => (
            <AppointmentCard key={idx} {...apt} viewerTimezone={selectedTz} />
          ))}
        </div>
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. 90-SERVICE CATALOG & BOOKING MODAL
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/services/service-booking-modal.tsx', `
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
        const wallet = await ApiClient.fetch(\`/billing/wallet/\${householdId}\`);
        if (wallet.balancePaise < service.pricePaise) {
          throw new Error(
            \`Insufficient wallet balance (\${formatPaiseToRupees(wallet.balancePaise)}). Top-up required for \${formatPaiseToRupees(service.pricePaise)}.\`
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
`);

writeFile('apps/family-portal/src/app/services/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { QuotaPricingBadge } from '@/components/services/quota-pricing-badge';
import { ServiceBookingModal } from '@/components/services/service-booking-modal';
import { Search, Sparkles } from 'lucide-react';

const sampleServices = [
  { id: '1', code: 'EMG-01', name: '24x7 SOS Dispatch & Ambulance Escalation', category: 'A_EMERGENCY', pricePaise: 0, isIncludedInPlan: true },
  { id: '2', code: 'MED-03', name: 'Geriatrician / Doctor Home Visit', category: 'B_CLINICAL', pricePaise: 150000, isIncludedInPlan: true, quotaRemaining: 2 },
  { id: '3', code: 'MED-04', name: 'GP & Specialist Video Teleconsultation', category: 'B_CLINICAL', pricePaise: 60000, isIncludedInPlan: true, quotaRemaining: 4 },
  { id: '4', code: 'MED-06', name: 'Home Blood Sample Collection (NABL Lab)', category: 'B_CLINICAL', pricePaise: 45000, isIncludedInPlan: true },
  { id: '5', code: 'CARE-01', name: 'Care Officer Bi-Weekly In-Person Health Visit', category: 'C_CARE_OFFICER', pricePaise: 0, isIncludedInPlan: true },
  { id: '6', code: 'NUR-01', name: 'Post-Op Wound Dressing & Bedsore Management', category: 'D_NURSING', pricePaise: 80000, isIncludedInPlan: false },
  { id: '7', code: 'PT-01', name: 'Geriatric Fall Prevention & Gait Physiotherapy', category: 'E_PHYSIOTHERAPY', pricePaise: 75000, isIncludedInPlan: false },
  { id: '8', code: 'HOM-01', name: 'Emergency Plumbing / Electrical Repair Facilitation', category: 'G_HOME_SAFETY', pricePaise: 35000, isIncludedInPlan: true },
  { id: '9', code: 'ADM-01', name: 'Cashless Hospital TPA Insurance Claim Liaison', category: 'J_ADMIN_FINANCIAL', pricePaise: 0, isIncludedInPlan: true },
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [bookingService, setBookingService] = useState<any | null>(null);

  const categories = [
    { key: 'ALL', label: 'All 90 Services' },
    { key: 'A_EMERGENCY', label: 'Emergency (A)' },
    { key: 'B_CLINICAL', label: 'Doctor & Diagnostics (B)' },
    { key: 'C_CARE_OFFICER', label: 'Care Officer (C)' },
    { key: 'D_NURSING', label: 'Nursing (D)' },
    { key: 'E_PHYSIOTHERAPY', label: 'Physiotherapy (E)' },
  ];

  const filtered = sampleServices.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">90-Service Catalog</h1>
              <Sparkles className="w-5 h-5 text-[#FE1D8F]" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Browse included subscription quotas and book specialized services with instant wallet holds
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor visit, ECG, nursing..."
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395] font-semibold transition"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={\`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all duration-300 \${
                selectedCategory === c.key
                  ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }\`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#12C395]/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-black text-[#12C395] bg-[#edfaf5] px-2.5 py-1 rounded-lg border border-[#12C395]/30">
                    {service.code}
                  </span>
                  <QuotaPricingBadge
                    isIncludedInPlan={service.isIncludedInPlan}
                    quotaRemaining={service.quotaRemaining}
                    pricePaise={service.pricePaise}
                  />
                </div>
                <h3 className="font-black text-slate-900 text-base mt-2 tracking-tight">{service.name}</h3>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Verified SOP</span>
                <button
                  onClick={() => setBookingService(service)}
                  className="px-4 py-2 bg-slate-900 hover:bg-gradient-to-r hover:from-[#12C395] hover:to-[#0ba17a] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow hover:scale-105 active:scale-95"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {bookingService && (
          <ServiceBookingModal
            service={bookingService}
            householdId="hh-blr-001"
            onClose={() => setBookingService(null)}
            onSuccess={() => alert('Service booked successfully!')}
          />
        )}
      </main>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 3. WALLET TOPUP MODAL, TRANSACTION LEDGER & MONTHLY VALUE DIGEST
// -------------------------------------------------------------

writeFile('apps/family-portal/src/components/wallet/wallet-topup-modal.tsx', `
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
      await ApiClient.fetch(\`/billing/wallet/\${walletId}/topup\`, {
        method: 'POST',
        body: JSON.stringify({
          amountPaise: amountRupees * 100,
          paymentReference: \`PG-INR-\${Date.now()}\`,
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
                className={\`py-3 text-xs font-black rounded-2xl border transition-all duration-300 \${
                  amountRupees === amt
                    ? 'border-[#12C395] bg-[#edfaf5] text-[#0ba17a] shadow-sm glow-primary scale-105'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }\`}
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
              {loading ? 'Processing...' : \`Pay ₹\${amountRupees.toLocaleString('en-IN')}\`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/components/wallet/transaction-ledger.tsx', `
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
                <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow \${
                  tx.type === 'CREDIT' ? 'bg-[#12C395] glow-primary' :
                  tx.type === 'HOLD' ? 'bg-[#FE1D8F] glow-secondary' :
                  tx.type === 'REFUND' ? 'bg-indigo-600' : 'bg-slate-700'
                }\`}>
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
                <span className={\`text-xs font-black \${isCredit ? 'text-[#0ba17a]' : 'text-slate-900'}\`}>
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
`);

writeFile('apps/family-portal/src/components/digest/monthly-value-digest.tsx', `
import React from 'react';
import { Award, CheckCircle2, HeartPulse, ShieldAlert, Download, Sparkles } from 'lucide-react';

export const MonthlyValueDigest: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-[#12C395] uppercase tracking-wider">Peace of Mind Report</span>
            <Sparkles className="w-4 h-4 text-[#FE1D8F]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">August 2026 Monthly Care Summary</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Household: Menon Residence (Bangalore) • Sampoorna Plan</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-3 bg-slate-900 hover:bg-gradient-to-r hover:from-[#12C395] hover:to-[#0ba17a] text-white text-xs font-bold rounded-2xl transition-all duration-300 shadow flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Print / PDF Invoice</span>
        </button>
      </div>

      {/* Metrics Highlights with Vibrant Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#12C395]">4</span>
          <p className="text-xs font-bold text-slate-700 mt-1">In-Person Visits Met</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#12C395]">28</span>
          <p className="text-xs font-bold text-slate-700 mt-1">Daily Vitals Logged</p>
        </div>
        <div className="p-5 bg-[#fee5f2]/40 rounded-3xl border border-[#FE1D8F]/20 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#FE1D8F]">1</span>
          <p className="text-xs font-bold text-[#830a43] mt-1">Preventive Catch (BP)</p>
        </div>
        <div className="p-5 bg-[#edfaf5] rounded-3xl border border-[#12C395]/30 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#0ba17a]">100%</span>
          <p className="text-xs font-bold text-[#0e5443] mt-1">Emergency Readiness</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-medium">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#edfaf5] to-[#d4f4ea]/40 border border-[#12C395]/30">
          <h4 className="font-black text-[#0e5443] text-sm mb-1.5">Clinical Intervention Summary</h4>
          <p>
            On Aug 18, Care Officer Ramesh Kumar noted morning systolic BP elevated at 130 mmHg. Dr. Anand Kulkarni reviewed telemetry, adjusted Amlodipine dosage, and scheduled a confirmatory follow-up, successfully stabilizing baseline pressure to 125/79 mmHg without hospital admission.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <h4 className="font-black text-slate-900 text-sm mb-1.5">Quantified Family Peace of Mind & Savings</h4>
          <p>
            Estimated hospitalization savings this month: <strong className="text-[#0ba17a]">₹45,000</strong> through timely medication review. All emergency access paths (ambulance priority route, ICE sheet, hospital pre-clearance) remain active.
          </p>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/family-portal/src/app/digest/page.tsx', `
'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { MonthlyValueDigest } from '@/components/digest/monthly-value-digest';

export default function DigestPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <MonthlyValueDigest />
      </main>
    </div>
  );
}
`);

console.log('Finished updating remaining UI pages with vibrant theme and micro-animations');

