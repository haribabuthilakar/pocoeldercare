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
