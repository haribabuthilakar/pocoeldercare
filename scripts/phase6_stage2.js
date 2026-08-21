const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. ABHA ABDM SYNC PANEL (INT-04)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/integrations/abha-sync-panel.tsx', `
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
                    className={\`px-2 py-0.5 rounded-full text-[10px] font-black uppercase \${
                      r.m3ConsentStatus === 'ACTIVE'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }\`}
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
`);

// -------------------------------------------------------------
// 2. DIAGNOSTIC LAB PARTNER WEBHOOK PANEL (INT-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/integrations/diagnostic-lab-webhook-panel.tsx', `
'use client';

import React, { useState } from 'react';
import { Activity, Download, FileText, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react';

export interface DiagnosticWebhookReport {
  id: string;
  labPartner: 'Dr. Lal PathLabs' | 'Thyrocare' | 'Agilus Diagnostics';
  seniorName: string;
  testPackage: string;
  receivedAt: string;
  pdfReportUrl: string;
  biomarkers: {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isCritical: boolean;
  }[];
  clinicalAlertTriggered: boolean;
}

const mockReports: DiagnosticWebhookReport[] = [
  {
    id: 'lab-9001',
    labPartner: 'Dr. Lal PathLabs',
    seniorName: 'Gopalakrishnan Menon',
    testPackage: 'Comprehensive Senior Diabetic & Lipid Profile',
    receivedAt: 'Today at 12:30 PM',
    pdfReportUrl: '/reports/menon_lalpathlabs_aug2026.pdf',
    biomarkers: [
      { name: 'HbA1c (Glycated Hb)', value: '8.8', unit: '%', referenceRange: '< 7.0%', isCritical: true },
      { name: 'Fasting Blood Sugar', value: '184', unit: 'mg/dL', referenceRange: '70 - 100', isCritical: true },
      { name: 'Total Cholesterol', value: '192', unit: 'mg/dL', referenceRange: '< 200', isCritical: false },
      { name: 'Serum Creatinine', value: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.2', isCritical: false },
      { name: 'Hemoglobin', value: '13.4', unit: 'g/dL', referenceRange: '13.0 - 17.0', isCritical: false },
    ],
    clinicalAlertTriggered: true,
  },
  {
    id: 'lab-9002',
    labPartner: 'Thyrocare',
    seniorName: 'Kalyani Raghavan',
    testPackage: 'Thyroid & Electrolyte Panel',
    receivedAt: 'Yesterday at 4:10 PM',
    pdfReportUrl: '/reports/raghavan_thyrocare_aug2026.pdf',
    biomarkers: [
      { name: 'TSH (Thyroid Stimulating)', value: '3.2', unit: 'uIU/mL', referenceRange: '0.4 - 4.2', isCritical: false },
      { name: 'Serum Sodium', value: '138', unit: 'mEq/L', referenceRange: '135 - 145', isCritical: false },
      { name: 'Serum Potassium', value: '4.4', unit: 'mEq/L', referenceRange: '3.5 - 5.0', isCritical: false },
    ],
    clinicalAlertTriggered: false,
  },
];

export const DiagnosticLabWebhookPanel: React.FC = () => {
  return (
    <div className="bento-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 m-0">
              Diagnostic Lab Webhook Ingestion & Biomarker Alerts
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Dr. Lal PathLabs • Thyrocare • Agilus Diagnostics (Auto-PDF & Critical Flags)
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs">
          Webhook Endpoint: /api/v1/webhooks/lab
        </span>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReports.map((report) => (
          <div key={report.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-black">
                    {report.labPartner}
                  </span>
                  <strong className="text-xs font-black text-slate-900">{report.seniorName}</strong>
                </div>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  {report.testPackage} • Ingested {report.receivedAt}
                </p>
              </div>

              {report.clinicalAlertTriggered && (
                <span className="px-2.5 py-1 rounded-xl bg-secondary-50 text-secondary-600 border border-secondary-200 text-[10px] font-black uppercase flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Critical Value Alert</span>
                </span>
              )}
            </div>

            {/* Biomarker Pills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {report.biomarkers.map((b) => (
                <div
                  key={b.name}
                  className={\`p-2.5 rounded-xl border \${
                    b.isCritical
                      ? 'bg-secondary-50/70 border-secondary-300 text-secondary-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }\`}
                >
                  <span className="text-[9px] text-slate-400 font-bold block truncate">{b.name}</span>
                  <strong className="text-sm font-black font-mono block">
                    {b.value} {b.unit}
                  </strong>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Ref: {b.referenceRange}
                  </span>
                </div>
              ))}
            </div>

            {/* Proactive Doctor Action */}
            {report.clinicalAlertTriggered && (
              <div className="p-3 rounded-xl bg-white border border-secondary-200 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-secondary-600" />
                  <span>Proactive Doctor Review Ticket Auto-Created (HbA1c &gt; 8.5%)</span>
                </span>
                <span className="text-brand-600 font-extrabold">Assigned to Dr. Arvind Narayanan</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. COMMUNITY STORY MOBILE LOGGER PAGE (INT-05)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/community/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Heart, Users, CheckCircle2, Share2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function CommunityLoggerPage() {
  const [title, setTitle] = useState('Morning Yoga & Laughter Therapy Workshop');
  const [category, setCategory] = useState('WELLNESS_WORKSHOP');
  const [selectedSeniors, setSelectedSeniors] = useState<string[]>(['Gopalakrishnan Menon', 'Kalyani Raghavan']);
  const [smileScore, setSmileScore] = useState(5);
  const [seniorQuote, setSeniorQuote] = useState('Today felt like meeting old friends from college days!');
  const [isPublished, setIsPublished] = useState(false);

  const seniorsList = [
    'Gopalakrishnan Menon',
    'Kalyani Raghavan',
    'Venkataraman Swaminathan',
    'Anasuya Rao',
    'Savitri Devi',
  ];

  const handleToggleSenior = (name: string) => {
    setSelectedSeniors((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Community & Content Lead Mobile Story Logger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            &lt;60s rapid mobile event capture • Family Portal 'Community Moments' publishing • Monthly digest highlights
          </p>
        </div>
      </div>

      {/* Main Story Logger Card */}
      <form onSubmit={handlePublish} className="bento-card p-6 space-y-5 text-xs">
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-brand-500 text-xs"
            required
          />
        </div>

        {/* Category & Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Event Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-brand-500 text-xs"
            >
              <option value="WELLNESS_WORKSHOP">Wellness & Yoga Workshop</option>
              <option value="MUSIC_NOSTALGIA">Classical Music & Nostalgia Hour</option>
              <option value="TECH_LITERACY">Senior Smartphone & Tech Literacy</option>
              <option value="GARDENING_CLUB">Herbal Gardening & Nature Walk</option>
            </select>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Smile & Engagement Score (1 - 5)
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setSmileScore(score)}
                  className={\`w-9 h-9 rounded-xl font-black text-xs transition-all \${
                    smileScore === score
                      ? 'bg-secondary-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }\`}
                >
                  ⭐ {score}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attendee Senior Multi-Select */}
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
            Tagged Senior Attendees ({selectedSeniors.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {seniorsList.map((senior) => {
              const isSelected = selectedSeniors.includes(senior);
              return (
                <button
                  type="button"
                  key={senior}
                  onClick={() => handleToggleSenior(senior)}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 border border-brand-300 font-black shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }\`}
                >
                  {isSelected ? '✓ ' : '+ '}{senior}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memorable Quote */}
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
            Memorable Senior Quote (For NRI Family Monthly Digest)
          </label>
          <textarea
            rows={2}
            value={seniorQuote}
            onChange={(e) => setSeniorQuote(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-brand-500 text-xs"
            placeholder="Share what the senior said during the activity..."
            required
          />
        </div>

        {/* Photo Upload Simulator */}
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
          <Camera size={24} className="mx-auto text-brand-600" />
          <span className="text-xs font-bold text-slate-700 block">Photo Attached (community_yoga_session.jpg)</span>
          <span className="text-[10px] text-slate-400 block">Automatically compressed & watermarked for privacy</span>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-slate-400 font-medium">Flows directly into Family Portal Moments feed.</span>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-xs glow-primary flex items-center gap-2 transition-all"
          >
            <Share2 size={15} />
            <span>{isPublished ? '✓ Published to Family Portal & Digest!' : 'Publish Community Story'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 4. INTEGRATIONS OVERVIEW PAGE (INT-04, INT-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/integrations/page.tsx', `
'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ShieldCheck, Activity, Headphones, Share2, ArrowRight } from 'lucide-react';
import { AbhaSyncPanel } from '../../components/integrations/abha-sync-panel';
import { DiagnosticLabWebhookPanel } from '../../components/integrations/diagnostic-lab-webhook-panel';

export default function IntegrationsOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            External Integrations & Telehealth Gateway
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            ABDM/ABHA Health Accounts • Diagnostic Lab Webhooks • Exotel Telephony Voice Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/voice-tickets"
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Headphones size={15} className="text-brand-600" />
            <span>Vernacular Voice Tickets</span>
          </Link>
          <Link
            href="/community"
            className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-xs glow-primary flex items-center gap-1.5 transition-all"
          >
            <Share2 size={15} />
            <span>Community Mobile Logger</span>
          </Link>
        </div>
      </div>

      {/* ABHA ABDM Sync Panel */}
      <AbhaSyncPanel />

      {/* Diagnostic Lab Webhook Panel */}
      <DiagnosticLabWebhookPanel />
    </div>
  );
}
`);

console.log('Finished Phase 6 Stage 2: ABHA, Lab Webhooks, Community Logger, and Integrations Page');

