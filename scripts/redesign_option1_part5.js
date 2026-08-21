const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. DYNAMIC SOP STUDIO MODAL & CATALOG PAGE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/catalog/sop-editor-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, CheckCircle2, Sparkles, AlertTriangle, Clock } from 'lucide-react';

export interface SopStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  isMandatory: boolean;
  requiresPhoto: boolean;
  requiresVoiceNote: boolean;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  basePriceInr: number;
  slaMinutes: number;
  currentVersion: string;
  activeStepsCount: number;
  steps: SopStep[];
}

export const SopEditorModal: React.FC<{
  service: ServiceItem;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (serviceId: string, newVersion: string, steps: SopStep[]) => void;
}> = ({ service, isOpen, onClose, onPublish }) => {
  const [steps, setSteps] = useState<SopStep[]>(service.steps || []);
  const [publishedVersion, setPublishedVersion] = useState('');

  if (!isOpen) return null;

  const handleAddStep = () => {
    const newStep: SopStep = {
      id: \`step-\${Date.now()}\`,
      stepNumber: steps.length + 1,
      title: 'New Checklist Step',
      instruction: 'Verify on-ground status and record confirmation.',
      isMandatory: true,
      requiresPhoto: false,
      requiresVoiceNote: false,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };

  const handlePublishOta = () => {
    const parts = service.currentVersion.replace('v', '').split('.').map(Number);
    const newVersion = \`v\${parts[0]}.\${parts[1] + 1}.0\`;
    setPublishedVersion(newVersion);
    onPublish(service.id, newVersion, steps);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black shadow-xs">
              SOP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 m-0">{service.name}</h3>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  {service.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium m-0">
                Dynamic SOP Protocol Engine • Current Active: {service.currentVersion}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Standard Operating Checklist ({steps.length} Steps)
            </span>
            <button
              onClick={handleAddStep}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={13} />
              <span>Add Checklist Step</span>
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSteps(steps.map((s) => (s.id === step.id ? { ...s, title: val } : s)));
                      }}
                      className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 outline-none w-full"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={step.isMandatory}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSteps(steps.map((s) => (s.id === step.id ? { ...s, isMandatory: val } : s)));
                      }}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Mandatory</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={step.requiresPhoto}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSteps(steps.map((s) => (s.id === step.id ? { ...s, requiresPhoto: val } : s)));
                      }}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Requires Photo Proof</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={step.requiresVoiceNote}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSteps(steps.map((s) => (s.id === step.id ? { ...s, requiresVoiceNote: val } : s)));
                      }}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Requires Voice Note</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Deploy Protocol Schema</span>
            <span className="text-[10px] text-slate-400 font-mono">Syncs OTA to all field apps immediately</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublishOta}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-xs glow-primary transition-all flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>{publishedVersion ? \`Published \${publishedVersion}!\` : 'Publish OTA Schema Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/catalog/page.tsx', `
'use client';

import React, { useState } from 'react';
import { SopEditorModal, ServiceItem } from '../../components/catalog/sop-editor-modal';
import { FileCode2, Search, Edit3, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

const mockCatalog: ServiceItem[] = [
  {
    id: 'srv-01',
    code: 'MED-03',
    name: 'Doctor Home Visit (Geriatrician)',
    category: 'CLINICAL_HOME_CARE',
    basePriceInr: 1200,
    slaMinutes: 45,
    currentVersion: 'v1.0.0',
    activeStepsCount: 4,
    steps: [
      { id: 'st-1', stepNumber: 1, title: 'Check-in & Sanitize Equipment', instruction: 'Sterilize BP cuff and stethoscope', isMandatory: true, requiresPhoto: false, requiresVoiceNote: false },
      { id: 'st-2', stepNumber: 2, title: 'Record Geriatric Vitals', instruction: 'BP, Pulse, SpO2, Blood Sugar', isMandatory: true, requiresPhoto: false, requiresVoiceNote: false },
      { id: 'st-3', stepNumber: 3, title: 'Medication Review & Reconciliation', instruction: 'Check pill box vs prescription', isMandatory: true, requiresPhoto: true, requiresVoiceNote: false },
      { id: 'st-4', stepNumber: 4, title: 'Generate Digital Rx & Care Plan', instruction: 'Issue prescription in system', isMandatory: true, requiresPhoto: false, requiresVoiceNote: true },
    ],
  },
  {
    id: 'srv-02',
    code: 'CO-01',
    name: 'Care Officer Bi-Weekly Check-in & Vitals',
    category: 'CARE_OFFICER_VISIT',
    basePriceInr: 0,
    slaMinutes: 30,
    currentVersion: 'v1.2.0',
    activeStepsCount: 3,
    steps: [
      { id: 'st-21', stepNumber: 1, title: 'Elder Wellness Conversation', instruction: 'Check mood, sleep, and appetite', isMandatory: true, requiresPhoto: false, requiresVoiceNote: true },
      { id: 'st-22', stepNumber: 2, title: 'Vitals Measurement & Alert Validation', instruction: 'Record vitals into field app', isMandatory: true, requiresPhoto: false, requiresVoiceNote: false },
      { id: 'st-23', stepNumber: 3, title: 'Kitchen & Medication Stock Verification', instruction: 'Take photo of kitchen fridge/pantry', isMandatory: true, requiresPhoto: true, requiresVoiceNote: false },
    ],
  },
  {
    id: 'srv-03',
    code: 'DA-04',
    name: 'Prescription Refill & Pill Box Dispensing',
    category: 'DAILY_LIVING_ASSIST',
    basePriceInr: 250,
    slaMinutes: 90,
    currentVersion: 'v1.1.0',
    activeStepsCount: 3,
    steps: [
      { id: 'st-31', stepNumber: 1, title: 'Pickup Medicines from Pharmacy', instruction: 'Verify invoice and batch numbers', isMandatory: true, requiresPhoto: true, requiresVoiceNote: false },
      { id: 'st-32', stepNumber: 2, title: 'Sort into 7-Day AM/PM Pill Box', instruction: 'Organize dosage in designated slots', isMandatory: true, requiresPhoto: true, requiresVoiceNote: false },
      { id: 'st-33', stepNumber: 3, title: 'Handover & Family Receipt Confirmation', instruction: 'Collect elder signature', isMandatory: true, requiresPhoto: false, requiresVoiceNote: true },
    ],
  },
];

export default function CatalogSopPage() {
  const [catalog, setCatalog] = useState<ServiceItem[]>(mockCatalog);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePublish = (serviceId: string, newVersion: string, steps: any[]) => {
    setCatalog((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? { ...s, currentVersion: newVersion, steps, activeStepsCount: steps.length }
          : s
      )
    );
  };

  const filtered = catalog.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">90-Service Catalog & Dynamic SOP Studio</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Standard operating checklist schemas, version bumping (`v1.0.0` → `v1.1.0`), and Over-The-Air field deployment
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-brand-400 shadow-xs"
          />
        </div>
      </div>

      {/* Catalog Table Bento Card */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Service Code</th>
                <th className="py-3.5 px-6">Protocol Name</th>
                <th className="py-3.5 px-6">Base Price / SLA</th>
                <th className="py-3.5 px-6">Active Version</th>
                <th className="py-3.5 px-6">Checklist Steps</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-black text-brand-700">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-slate-900 block font-extrabold">{item.name}</strong>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.category}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-900 font-extrabold">
                      {item.basePriceInr === 0 ? 'Included in Plan' : \`₹\${item.basePriceInr}\`}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      ⏱ {item.slaMinutes} min SLA
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.currentVersion}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-brand-700 font-extrabold">
                      {item.activeStepsCount} Active Steps
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedService(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
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

      {/* Dynamic SOP Editor Modal */}
      {selectedService && (
        <SopEditorModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. PARTNER PAYOUT RECONCILIATION & GST LEDGER
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/payouts/payout-statement-table.tsx', `
'use client';

import React, { useState } from 'react';
import { Wallet, Download, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';

export interface PayoutStatement {
  id: string;
  partnerName: string;
  category: string;
  completedVisits: number;
  grossAmountInr: number;
  tdsPercentage: number;
  tdsAmountInr: number;
  netPayoutInr: number;
  billingPeriod: string;
  status: 'APPROVED' | 'PENDING_AUDIT' | 'PAID';
}

const mockStatements: PayoutStatement[] = [
  {
    id: 'pay-001',
    partnerName: 'Dr. Ananya Sen, MD (Geriatrician)',
    category: 'CLINICAL',
    completedVisits: 14,
    grossAmountInr: 16800,
    tdsPercentage: 10,
    tdsAmountInr: 1680,
    netPayoutInr: 15120,
    billingPeriod: 'Aug 2026',
    status: 'PENDING_AUDIT',
  },
  {
    id: 'pay-002',
    partnerName: 'Apollo ALS Ambulance Fleet',
    category: 'EMERGENCY_LOGISTICS',
    completedVisits: 6,
    grossAmountInr: 15000,
    tdsPercentage: 2,
    tdsAmountInr: 300,
    netPayoutInr: 14700,
    billingPeriod: 'Aug 2026',
    status: 'APPROVED',
  },
  {
    id: 'pay-003',
    partnerName: 'Thyrocare Home Diagnostics',
    category: 'DIAGNOSTICS',
    completedVisits: 22,
    grossAmountInr: 7700,
    tdsPercentage: 2,
    tdsAmountInr: 154,
    netPayoutInr: 7546,
    billingPeriod: 'Aug 2026',
    status: 'PAID',
  },
];

export const PayoutStatementTable: React.FC = () => {
  const [statements, setStatements] = useState<PayoutStatement[]>(mockStatements);
  const [isExporting, setIsExporting] = useState(false);

  const handleApproveBatch = () => {
    setStatements(statements.map((s) => ({ ...s, status: 'APPROVED' })));
  };

  const handleExportGstCsv = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const totalGross = statements.reduce((acc, s) => acc + s.grossAmountInr, 0);
  const totalTds = statements.reduce((acc, s) => acc + s.tdsAmountInr, 0);
  const totalNet = statements.reduce((acc, s) => acc + s.netPayoutInr, 0);

  return (
    <div className="space-y-6">
      {/* 3 Financial Telemetry Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gross Partner Accrual</span>
          <div className="text-2xl font-black text-slate-900">₹{totalGross.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-500 font-medium">42 Total Completed Deliverables</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TDS Withheld (194J/194C)</span>
          <div className="text-2xl font-black text-brand-600">₹{totalTds.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-500 font-medium">Automated Form 16A Reconciliation</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Net Payout Disbursable</span>
          <div className="text-2xl font-black text-emerald-600">₹{totalNet.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-700 font-bold">1-Click Batch NEFT / RazorpayX</span>
        </div>
      </div>

      {/* Main Ledger Bento Table */}
      <div className="bento-card overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">Monthly Partner Payout & TDS Ledger</h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Contracted rate card reconciliation, automated TDS deduction & GST compliance exports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportGstCsv}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>{isExporting ? 'Generating GST CSV...' : 'Download GST CSV'}</span>
            </button>
            <button
              onClick={handleApproveBatch}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-xs glow-primary flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Approve All Payouts</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Partner & Category</th>
                <th className="py-3 px-6">Visits</th>
                <th className="py-3 px-6">Gross Amount</th>
                <th className="py-3 px-6">TDS Withholding</th>
                <th className="py-3 px-6">Net Payable</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
              {statements.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <strong className="text-slate-900 block font-extrabold">{st.partnerName}</strong>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">{st.category}</span>
                  </td>
                  <td className="py-4 px-6 font-mono">{st.completedVisits} visits</td>
                  <td className="py-4 px-6 font-mono text-slate-900">₹{st.grossAmountInr.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 font-mono text-secondary-600">
                    -₹{st.tdsAmountInr.toLocaleString('en-IN')} ({st.tdsPercentage}%)
                  </td>
                  <td className="py-4 px-6 font-mono text-emerald-600 font-extrabold">
                    ₹{st.netPayoutInr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={\`px-2.5 py-1 rounded-full text-[10px] font-extrabold border \${
                        st.status === 'APPROVED'
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : st.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }\`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/payouts/page.tsx', `
'use client';

import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 m-0">Partner Payout & TDS Financial Reconciliation</h2>
        <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
          Contracted rate audits, Section 194J/194C TDS compliance, and GST statement rollups
        </p>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
`);

console.log('Finished Option 1 Part 5: Catalog SOP Studio and Payouts Financial Ledger');

