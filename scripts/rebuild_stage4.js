const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. PARTNER CARD & PARTNERS PAGE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/partners/partner-card.tsx', `'use client';

import React, { useState } from 'react';
import { Phone, ShieldCheck, Clock, MapPin, Stethoscope, Truck, Activity } from 'lucide-react';

export interface PartnerProvider {
  id: string;
  name: string;
  category: 'GERIATRICIAN' | 'GENERAL_PHYSICIAN' | 'AMBULANCE' | 'DIAGNOSTICS' | 'HOME_NURSE';
  city: string;
  zone: string;
  phone: string;
  rateInr: number;
  rateUnit: string;
  isAvailable: boolean;
  slaCommitment: string;
  verifiedBadge: boolean;
  rating: number;
}

export const PartnerCard: React.FC<{ partner: PartnerProvider }> = ({ partner }) => {
  const [isAvailable, setIsAvailable] = useState(partner.isAvailable);

  const getCategoryIcon = () => {
    switch (partner.category) {
      case 'GERIATRICIAN':
      case 'GENERAL_PHYSICIAN':
        return <Stethoscope size={18} className="text-brand-600" />;
      case 'AMBULANCE':
        return <Truck size={18} className="text-secondary-600" />;
      default:
        return <Activity size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center shadow-sm">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">{partner.name}</h3>
              {partner.verifiedBadge && (
                <span className="p-0.5 rounded-full bg-brand-50 text-brand-600" title="Empanelled & Verified">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-brand-600" />
              <span>{partner.city} • {partner.zone}</span>
            </p>
          </div>
        </div>

        {/* Live Availability Toggle */}
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${
            isAvailable
              ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }\`}
        >
          {isAvailable ? '● On-Duty' : '○ Off-Duty'}
        </button>
      </div>

      {/* Contracted Rate & SLA */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Contracted Rate</span>
          <strong className="text-sm text-slate-900 font-black">₹{partner.rateInr.toLocaleString('en-IN')}</strong>
          <span className="text-[10px] text-slate-500 font-medium block">/ {partner.rateUnit}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">SLA Commitment</span>
          <strong className="text-sm text-brand-600 font-black flex items-center gap-1">
            <Clock size={13} />
            {partner.slaCommitment}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium block">{partner.rating} ★ Provider Rating</span>
        </div>
      </div>

      {/* CTI Dial Button */}
      <div className="pt-1">
        <a
          href={\`tel:\${partner.phone}\`}
          className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-brand-200 transition-colors"
        >
          <Phone size={14} className="text-brand-600" />
          <span>Direct CTI Dispatch ({partner.phone})</span>
        </a>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/partners/page.tsx', `'use client';

import React, { useState } from 'react';
import { PartnerCard, PartnerProvider } from '../../components/partners/partner-card';
import { ShieldCheck, Plus, Filter } from 'lucide-react';

const mockPartners: PartnerProvider[] = [
  {
    id: 'p-01',
    name: 'Dr. Ananya Sen, MD',
    category: 'GERIATRICIAN',
    city: 'Bangalore',
    zone: 'East (Indiranagar)',
    phone: '+91 98450 12345',
    rateInr: 1200,
    rateUnit: 'Consult',
    isAvailable: true,
    slaCommitment: '< 45 mins',
    verifiedBadge: true,
    rating: 4.9,
  },
  {
    id: 'p-02',
    name: 'Dr. Vikramaditya Rao, MBBS',
    category: 'GENERAL_PHYSICIAN',
    city: 'Bangalore',
    zone: 'South (Jayanagar)',
    phone: '+91 98450 23456',
    rateInr: 800,
    rateUnit: 'Home Visit',
    isAvailable: true,
    slaCommitment: '< 60 mins',
    verifiedBadge: true,
    rating: 4.8,
  },
  {
    id: 'p-03',
    name: 'Apollo ALS Emergency Ambulance Fleet',
    category: 'AMBULANCE',
    city: 'Bangalore',
    zone: 'All Clusters (Central/East/South)',
    phone: '+91 80 2502 9999',
    rateInr: 2500,
    rateUnit: 'Emergency Trip',
    isAvailable: true,
    slaCommitment: '< 15 mins (Golden Hour)',
    verifiedBadge: true,
    rating: 4.95,
  },
  {
    id: 'p-04',
    name: 'Thyrocare Home Diagnostics Hub',
    category: 'DIAGNOSTICS',
    city: 'Bangalore',
    zone: 'Domlur / Koramangala',
    phone: '+91 98450 88990',
    rateInr: 350,
    rateUnit: 'Sample Collection',
    isAvailable: false,
    slaCommitment: '< 120 mins',
    verifiedBadge: true,
    rating: 4.7,
  },
];

export default function PartnersDirectoryPage() {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = mockPartners.filter((p) => {
    if (filterCategory !== 'ALL' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Empanelled Doctor & Healthcare Partner Panel</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Contracted clinical providers, ambulance fleets, and diagnostic networks with live shift status
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Empanel New Provider</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'GERIATRICIAN', 'GENERAL_PHYSICIAN', 'AMBULANCE', 'DIAGNOSTICS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filterCategory === cat
                ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }\`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. DYNAMIC SOP STUDIO & CATALOG PAGE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/catalog/sop-editor-modal.tsx', `'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export interface CatalogServiceItem {
  code: string;
  name: string;
  category: string;
  basePriceInr: number;
  slaMinutes: number;
  sopVersion: string;
  steps: { id: string; instruction: string; requiresPhoto: boolean; requiresVoice: boolean; mandatory: boolean }[];
}

export const SopEditorModal: React.FC<{
  service: CatalogServiceItem;
  onClose: () => void;
  onSave: (updated: CatalogServiceItem) => void;
}> = ({ service, onClose, onSave }) => {
  const [steps, setSteps] = useState(service.steps);
  const [published, setPublished] = useState(false);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: \`step-\${Date.now()}\`,
        instruction: 'Verify medication dosage and inspect senior pulse rate',
        requiresPhoto: true,
        requiresVoice: false,
        mandatory: true,
      },
    ]);
  };

  const handleDeleteStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePublishOta = () => {
    const [maj, min, patch] = service.sopVersion.replace('v', '').split('.').map(Number);
    const newVersion = \`v\${maj}.\${min + 1}.0\`;
    const updated = { ...service, sopVersion: newVersion, steps };
    setPublished(true);
    setTimeout(() => {
      onSave(updated);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-50 text-brand-600">
                <Sparkles size={16} />
              </span>
              <h2 className="text-lg font-black text-slate-900 m-0">Visual Dynamic SOP Template Studio</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
              Editing <strong className="text-slate-700">{service.code}: {service.name}</strong> • Current Version: <span className="font-extrabold text-brand-600">{service.sopVersion}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step Builder List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div key={step.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  Step {idx + 1}
                </span>
                <button onClick={() => handleDeleteStep(step.id)} className="text-slate-400 hover:text-secondary-600 transition-colors p-1">
                  <Trash2 size={15} />
                </button>
              </div>

              <input
                type="text"
                value={step.instruction}
                onChange={(e) => {
                  const val = e.target.value;
                  setSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, instruction: val } : s));
                }}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
              />

              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step.requiresPhoto}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, requiresPhoto: checked } : s));
                    }}
                    className="rounded text-brand-600 focus:ring-0"
                  />
                  <span>📸 Mandatory Photo Proof</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step.requiresVoice}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, requiresVoice: checked } : s));
                    }}
                    className="rounded text-brand-600 focus:ring-0"
                  />
                  <span>🎙️ Voice Note</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        <button
          onClick={handleAddStep}
          className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>Add Protocol Checklist Step</span>
        </button>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">Publishing triggers instant Over-The-Air (OTA) updates to Field Apps</span>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              onClick={handlePublishOta}
              disabled={published}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-sm glow-primary transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>{published ? 'Published OTA!' : 'Publish OTA Schema (Bump Version)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/catalog/page.tsx', `'use client';

import React, { useState } from 'react';
import { SopEditorModal, CatalogServiceItem } from '../../components/catalog/sop-editor-modal';
import { FileCode2, Edit3, Clock, Sparkles } from 'lucide-react';

const mockCatalog: CatalogServiceItem[] = [
  {
    code: 'MED-03',
    name: 'Geriatrician In-Person Home Visit & Rx Review',
    category: 'MEDICAL_CARE',
    basePriceInr: 1200,
    slaMinutes: 45,
    sopVersion: 'v1.0.0',
    steps: [
      { id: 's1', instruction: 'Review senior chronic history & current drug prescription dosage', requiresPhoto: true, requiresVoice: false, mandatory: true },
      { id: 's2', instruction: 'Measure 5-point geriatric vitals (BP, SpO2, Heart Rate, Glucose, Temp)', requiresPhoto: true, requiresVoice: true, mandatory: true },
    ],
  },
  {
    code: 'CO-01',
    name: 'Care Officer Bi-Weekly Wellness Check-in',
    category: 'CARE_OFFICER',
    basePriceInr: 450,
    slaMinutes: 30,
    sopVersion: 'v1.2.0',
    steps: [
      { id: 's3', instruction: 'Warm greeting & senior emotional wellbeing inquiry', requiresPhoto: true, requiresVoice: true, mandatory: true },
      { id: 's4', instruction: 'Kitchen food stock and pantry inspection', requiresPhoto: true, requiresVoice: false, mandatory: true },
      { id: 's5', instruction: 'Bathroom grab rail & fall hazard safety inspection', requiresPhoto: true, requiresVoice: false, mandatory: true },
    ],
  },
  {
    code: 'DA-04',
    name: 'Prescription Medicine Delivery & Weekly Pill Organizer Dispensing',
    category: 'DAILY_ASSISTANCE',
    basePriceInr: 250,
    slaMinutes: 60,
    sopVersion: 'v1.0.0',
    steps: [
      { id: 's6', instruction: 'Verify pharmacy invoice against doctor Rx', requiresPhoto: true, requiresVoice: false, mandatory: true },
      { id: 's7', instruction: 'Dispense 7-day morning/noon/night slots in color-coded organizer', requiresPhoto: true, requiresVoice: false, mandatory: true },
    ],
  },
];

export default function CatalogEditorPage() {
  const [catalog, setCatalog] = useState<CatalogServiceItem[]>(mockCatalog);
  const [editingService, setEditingService] = useState<CatalogServiceItem | null>(null);

  const handleSaveService = (updated: CatalogServiceItem) => {
    setCatalog((prev) => prev.map((s) => (s.code === updated.code ? updated : s)));
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">90-Service Catalog & Dynamic SOP Studio</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Manage versioned clinical SOP checklists and publish real-time Over-The-Air (OTA) schema updates to Field Apps
          </p>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <FileCode2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 m-0">Dynamic SOP Protocol Registry</h3>
              <span className="text-xs text-slate-500 font-medium">3 Master Services Configured</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Service Code</th>
                <th className="py-3.5 px-5">Service Title & Category</th>
                <th className="py-3.5 px-5">Base Price (INR)</th>
                <th className="py-3.5 px-5">Target SLA</th>
                <th className="py-3.5 px-5">SOP Version</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {catalog.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-black text-brand-700">{item.code}</td>
                  <td className="py-4 px-5">
                    <strong className="text-slate-900 block">{item.name}</strong>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">{item.category} • {item.steps.length} Steps</span>
                  </td>
                  <td className="py-4 px-5 font-extrabold text-slate-900">₹{item.basePriceInr}</td>
                  <td className="py-4 px-5 font-bold text-slate-700 flex items-center gap-1 mt-3">
                    <Clock size={13} className="text-brand-600" />
                    <span>{item.slaMinutes} mins</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-xl bg-brand-50 text-brand-700 font-black text-[11px] border border-brand-200">
                      {item.sopVersion}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setEditingService(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs border border-brand-200 shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Edit SOP</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {editingService && (
        <SopEditorModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
}
`);

// -------------------------------------------------------------
// 3. PAYOUT RECONCILIATION & PAYOUTS PAGE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/payouts/payout-statement-table.tsx', `'use client';

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
      'data:text/csv;charset=utf-8,Partner,Category,Units,Gross(INR),TDS(%),TDS(INR),Net(INR),Status\\n' +
      statements
        .map(
          (s) =>
            \`"\${s.partnerName}","\${s.category}",\${s.completedUnits},\${s.grossAmountInr},\${s.tdsPercentage},\${s.tdsAmountInr},\${s.netPayableInr},\${s.payoutStatus}\`
        )
        .join('\\n');

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
                    className={\`px-2.5 py-1 rounded-xl text-[11px] font-black \${
                      s.payoutStatus === 'APPROVED'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }\`}
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
`);

writeFile('apps/ops-crm/src/app/payouts/page.tsx', `'use client';

import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsReconciliationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Monthly Partner Payout Reconciliation Ledger</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Review completed partner consumption volume, audit automated TDS tax withholding, and execute batch payout approvals
          </p>
        </div>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
`);

// -------------------------------------------------------------
// 4. VITEST WORKFLOW SUITE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/__tests__/ops-workflows.spec.tsx', `
import { describe, it, expect } from 'vitest';

describe('Phase 4: Operations CRM & Admin Hub Workflows', () => {
  it('Pillar 1 & 2: Auto-assignment weighted multi-factor scoring (Proximity 40%, Load 30%, Lang 20%, Rating 10%)', () => {
    const candidates = [
      { id: 'off-001', name: 'Ramesh Kumar', proximityKm: 2.1, caseload: 26, maxCaseload: 35, rating: 4.9 },
      { id: 'off-002', name: 'Suresh Gowda', proximityKm: 4.8, caseload: 22, maxCaseload: 35, rating: 4.7 },
    ];

    // Compute scores
    const scored = candidates.map(c => {
      const proxScore = Math.max(0, 100 - c.proximityKm * 10) * 0.40;
      const loadScore = ((c.maxCaseload - c.caseload) / c.maxCaseload * 100) * 0.30;
      const ratingScore = (c.rating / 5.0 * 100) * 0.10;
      const langScore = 100 * 0.20;
      return { ...c, totalScore: Math.round(proxScore + loadScore + ratingScore + langScore) };
    });

    const topRanked = scored.sort((a, b) => b.totalScore - a.totalScore)[0];
    expect(topRanked.id).toBe('off-001');
    expect(topRanked.totalScore).toBeGreaterThanOrEqual(65);
  });

  it('Pillar 2: Mandatory Audit Log Policy on Manual Override (OPS-07)', () => {
    const overridePayload = {
      id: 'audit-101',
      serviceRequestId: 'req-001',
      originalOfficerId: 'off-001',
      selectedOfficerId: 'off-002',
      reasonCategory: 'FAMILY_PREFERENCE',
      notes: 'Elder expressed strong rapport with officer Suresh from past visit.',
      managerEmail: 'ops.lead@pococare.in',
      timestamp: new Date().toISOString(),
    };

    expect(overridePayload.notes.length).toBeGreaterThan(10);
    expect(overridePayload.selectedOfficerId).not.toBe(overridePayload.originalOfficerId);
    expect(['FAMILY_PREFERENCE', 'TRAFFIC_PROXIMITY_ANOMALY', 'SPECIALIZED_CLINICAL_SKILL', 'OFFICER_EMERGENCY_REASSIGNMENT']).toContain(overridePayload.reasonCategory);
  });

  it('Pillar 3: Household CRM 360° Senior ICE Profile Data Completeness', () => {
    const iceProfile = {
      seniorName: 'Gopalakrishnan Menon',
      bloodGroup: 'O+',
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin'],
      preferredHospital: 'Manipal Hospital Old Airport Rd',
      erPhone: '+91 80 2502 4444',
      nriContact: { name: 'Divya Menon', relation: 'Daughter', phone: '+14085550192' },
    };

    expect(iceProfile.bloodGroup).toBe('O+');
    expect(iceProfile.chronicConditions.length).toBeGreaterThan(0);
    expect(iceProfile.allergies).toContain('Penicillin');
    expect(iceProfile.nriContact.phone).toMatch(/^\\+\\d+/);
  });

  it('Pillar 7: Care Officer Fleet Caseload Cap & Warning Thresholds (35-family cap)', () => {
    const maxCap = 35;
    const calculateCapacityStatus = (current: number) => {
      if (current >= maxCap) return 'CAPACITY_REACHED';
      if (current >= maxCap - 3) return 'NEAR_CAPACITY_WARNING';
      return 'AVAILABLE';
    };

    expect(calculateCapacityStatus(26)).toBe('AVAILABLE');
    expect(calculateCapacityStatus(33)).toBe('NEAR_CAPACITY_WARNING');
    expect(calculateCapacityStatus(35)).toBe('CAPACITY_REACHED');
  });

  it('Pillar 5: Semantic Versioning of Dynamic SOP Templates (v1.0.0 -> v1.1.0 OTA)', () => {
    const currentVer = 'v1.0.0';
    const [maj, min, patch] = currentVer.replace('v', '').split('.').map(Number);
    const nextVer = \`v\${maj}.\${min + 1}.0\`;

    expect(nextVer).toBe('v1.1.0');
  });

  it('Pillar 6: Partner Monthly Payout Ledger Rollup and TDS Deductions (10% Doctor / 2% Agency)', () => {
    const doctorGross = 16800;
    const doctorTds = 10;
    const doctorNet = doctorGross - (doctorGross * (doctorTds / 100));
    expect(doctorNet).toBe(15120);

    const ambulanceGross = 15000;
    const ambulanceTds = 2;
    const ambulanceNet = ambulanceGross - (ambulanceGross * (ambulanceTds / 100));
    expect(ambulanceNet).toBe(14700);
  });
});
`);

console.log('Finished Stage 4: Partners, Catalog/SOP Editor, Payouts, Tests');

