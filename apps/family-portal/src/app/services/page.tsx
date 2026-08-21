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
              className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all duration-300 ${
                selectedCategory === c.key
                  ? 'bg-gradient-to-r from-[#12C395] to-[#0ba17a] text-white shadow-md glow-primary scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
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
