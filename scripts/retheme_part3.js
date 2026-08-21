const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('apps/ops-crm/src/app/partners/page.tsx', `'use client';

import React, { useState } from 'react';
import { PartnerCard, PartnerProvider } from '../../components/partners/partner-card';
import { Plus } from 'lucide-react';

const mockPartners: PartnerProvider[] = [
  {
    id: 'part-001',
    name: 'Dr. Arvind Swamy (MD Geriatrics)',
    category: 'DOCTOR',
    specialization: 'Geriatric Medicine & Cognitive Health',
    city: 'Bangalore',
    phone: '+91 98450 33445',
    contractedRateINR: 1200,
    rateUnit: 'Consultation',
    isAvailable: true,
    slaMinutes: 30,
  },
  {
    id: 'part-002',
    name: 'MedPlus Advanced ALS Ambulance #14',
    category: 'AMBULANCE',
    specialization: 'Advanced Cardiac Life Support (ACLS)',
    city: 'Bangalore East',
    phone: '+91 80 6165 9999',
    contractedRateINR: 2500,
    rateUnit: 'Emergency Trip',
    isAvailable: true,
    slaMinutes: 15,
  },
  {
    id: 'part-003',
    name: 'Apollo Diagnostics Mobile Phlebotomy',
    category: 'DIAGNOSTICS',
    specialization: 'Home Fasting Blood & Urine Sample Pickup',
    city: 'Bangalore',
    phone: '+91 80 4433 2211',
    contractedRateINR: 350,
    rateUnit: 'Home Collection',
    isAvailable: true,
    slaMinutes: 60,
  },
  {
    id: 'part-004',
    name: 'Nightingales Home Care Nursing',
    category: 'HOME_NURSE',
    specialization: 'Post-Op Wound Dressing & IV Administration',
    city: 'Bangalore',
    phone: '+91 80 7788 9900',
    contractedRateINR: 800,
    rateUnit: 'Nursing Visit',
    isAvailable: false,
    slaMinutes: 120,
  },
];

export default function PartnerDirectoryPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = mockPartners.filter((p) => {
    if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Empanelled Doctor & Partner Panel</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Verified clinical specialists, ambulance fleets, and contracted rate cards</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Empanel New Partner</span>
        </button>
      </div>

      {/* Category Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'DOCTOR', 'AMBULANCE', 'DIAGNOSTICS', 'HOME_NURSE'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              selectedCat === cat
                ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/partners/partner-card.tsx', `'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';

export interface PartnerProvider {
  id: string;
  name: string;
  category: 'DOCTOR' | 'AMBULANCE' | 'DIAGNOSTICS' | 'HOME_NURSE';
  specialization: string;
  city: string;
  phone: string;
  contractedRateINR: number;
  rateUnit: string;
  isAvailable: boolean;
  slaMinutes: number;
}

export const PartnerCard: React.FC<{ partner: PartnerProvider }> = ({ partner }) => {
  const [isOnline, setIsOnline] = useState(partner.isAvailable);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {partner.category}
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-1.5 mb-0.5">{partner.name}</h3>
          <p className="text-xs text-slate-500 m-0 font-medium">{partner.specialization}</p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={\`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all \${
            isOnline
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }\`}
        >
          {isOnline ? 'Active on Shift' : 'Off-Duty'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 py-3 border-y border-slate-100 font-medium">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">City & SLA</span>
          <strong>{partner.city} • &lt;{partner.slaMinutes}m</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Contracted Rate</span>
          <strong className="text-brand-600">₹{partner.contractedRateINR} / {partner.rateUnit}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <a href={\`tel:\${partner.phone}\`} className="flex items-center gap-1.5 text-brand-600 font-extrabold hover:underline">
          <Phone size={13} />
          <span>{partner.phone}</span>
        </a>

        <span className="text-[11px] text-slate-500 font-semibold">Verified Partner</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/catalog/page.tsx', `'use client';

import React, { useState } from 'react';
import { SopEditorModal, SopTemplateVersion, SopStepDef } from '../../components/catalog/sop-editor-modal';
import { Plus, Edit, Check } from 'lucide-react';

const mockTemplates: SopTemplateVersion[] = [
  {
    serviceCode: 'SOP-CARE-01',
    serviceName: 'Dedicated Care Officer In-Person Visit',
    currentVersion: 'v1.1.0',
    steps: [
      { id: 'st-1', order: 1, name: 'Elder Orientation & Fall Risk Assessment', category: 'Safety', requiresPhoto: false, requiresVoice: false },
      { id: 'st-2', order: 2, name: 'Pillbox Medication Adherence & Refill Check', category: 'Clinical', requiresPhoto: true, requiresVoice: false },
      { id: 'st-3', order: 3, name: 'Bathroom Anti-Slip Mats & Grab Rail Inspection', category: 'Safety', requiresPhoto: true, requiresVoice: false },
      { id: 'st-4', order: 4, name: 'Dietary & Fluid Intake Check', category: 'Nutrition', requiresPhoto: false, requiresVoice: false },
    ],
  },
  {
    serviceCode: 'SOP-MED-03',
    serviceName: 'Doctor Home Clinical Visit (MED-03)',
    currentVersion: 'v1.0.0',
    steps: [
      { id: 'st-10', order: 1, name: 'Comprehensive Geriatric Assessment (CGA)', category: 'Clinical', requiresPhoto: false, requiresVoice: true },
      { id: 'st-11', order: 2, name: 'Physical Examination & Prescription Formulation', category: 'Clinical', requiresPhoto: true, requiresVoice: false },
    ],
  },
  {
    serviceCode: 'SOP-EMG-01',
    serviceName: '24x7 Ambulance Dispatch & Trauma Pre-Brief',
    currentVersion: 'v2.0.0',
    steps: [
      { id: 'st-20', order: 1, name: 'Sub-2s Senior ICE Profile Query & Allergy Pull', category: 'Emergency', requiresPhoto: false, requiresVoice: false },
      { id: 'st-21', order: 2, name: 'Hospital ER Trauma Bay Pre-Notification', category: 'Emergency', requiresPhoto: false, requiresVoice: false },
    ],
  },
];

export default function CatalogEditorPage() {
  const [templates, setTemplates] = useState<SopTemplateVersion[]>(mockTemplates);
  const [activeTemplate, setActiveTemplate] = useState<SopTemplateVersion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePublish = (newVer: string, updatedSteps: SopStepDef[]) => {
    if (!activeTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.serviceCode === activeTemplate.serviceCode
          ? { ...t, currentVersion: newVer, steps: updatedSteps }
          : t
      )
    );
    setToastMessage(\`Successfully published \${activeTemplate.serviceCode} \${newVer} OTA to all field apps!\`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <Check size={16} className="text-brand-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">90-Service Catalog & Dynamic SOP Editor</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Versioned OTA templates delivered instantly to Field App without app updates</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Create New SOP Template</span>
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div key={tpl.serviceCode} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {tpl.serviceCode}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1.5 mb-0.5">{tpl.serviceName}</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                {tpl.currentVersion}
              </span>
            </div>

            <div className="text-xs text-slate-600 py-2 border-y border-slate-100 space-y-1.5">
              {tpl.steps.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {idx + 1}
                  </span>
                  <span className="truncate text-slate-700 font-medium">{s.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTemplate(tpl)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-brand-700 border border-brand-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
            >
              <Edit size={13} />
              <span>Edit Protocol & Bump Version</span>
            </button>
          </div>
        ))}
      </div>

      {activeTemplate && (
        <SopEditorModal
          template={activeTemplate}
          onClose={() => setActiveTemplate(null)}
          onPublishVersion={handlePublish}
        />
      )}
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/catalog/sop-editor-modal.tsx', `'use client';

import React, { useState } from 'react';
import { FileCode2, X, Plus, Trash2, Check } from 'lucide-react';

export interface SopStepDef {
  id: string;
  order: number;
  name: string;
  category: string;
  requiresPhoto: boolean;
  requiresVoice: boolean;
}

export interface SopTemplateVersion {
  serviceCode: string;
  serviceName: string;
  currentVersion: string;
  steps: SopStepDef[];
}

export const SopEditorModal: React.FC<{
  template: SopTemplateVersion;
  onClose: () => void;
  onPublishVersion: (newVersion: string, steps: SopStepDef[]) => void;
}> = ({ template, onClose, onPublishVersion }) => {
  const [steps, setSteps] = useState<SopStepDef[]>(template.steps);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newStepName, setNewStepName] = useState('');

  const [major, minor, patch] = template.currentVersion.replace('v', '').split('.').map(Number);
  const nextMinorVersion = \`v\${major}.\${minor + 1}.0\`;

  const handleAddStep = () => {
    if (!newStepName.trim()) return;
    const newStep: SopStepDef = {
      id: \`step-\${Date.now()}\`,
      order: steps.length + 1,
      name: newStepName,
      category: 'Safety',
      requiresPhoto: true,
      requiresVoice: false,
    };
    setSteps([...steps, newStep]);
    setNewStepName('');
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onPublishVersion(nextMinorVersion, steps);
      setIsPublishing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-100">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
            <FileCode2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0">Visual Dynamic SOP Template Editor</h3>
            <p className="text-xs text-slate-500 m-0">
              {template.serviceCode} • <strong className="text-slate-800">{template.serviceName}</strong> (Current: {template.currentVersion})
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100">
            <span>Protocol Step Sequence (OTA JSON Schema)</span>
            <span>{steps.length} Steps Active</span>
          </div>

          {steps.map((step, idx) => (
            <div key={step.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900">{step.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={\`text-[10px] font-extrabold px-2 py-0.5 rounded-md border \${
                  step.requiresPhoto
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-white text-slate-500 border-slate-200'
                }\`}>
                  📷 Photo Proof
                </span>
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="p-1 text-slate-400 hover:text-secondary-600 rounded-md bg-white border border-slate-200"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex gap-2">
          <input
            type="text"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder="Add new SOP verification step..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
          />
          <button
            onClick={handleAddStep}
            className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Step</span>
          </button>
        </div>

        {/* Publish */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Publishing will release <strong className="text-brand-600">{nextMinorVersion}</strong> OTA to all Field Care Officers immediately.
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm glow-primary"
            >
              <span>{isPublishing ? 'Publishing...' : \`Publish \${nextMinorVersion} OTA\`}</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/payouts/page.tsx', `'use client';

import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 m-0">Partner & Doctor Payout Reconciliation</h2>
        <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">Automated consumption ledger rollups, TDS deductions, and GST export statements</p>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/payouts/payout-statement-table.tsx', `'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

interface PayoutRollup {
  id: string;
  partnerName: string;
  category: string;
  billingMonth: string;
  completedUnits: number;
  unitRateINR: number;
  grossAmountINR: number;
  tdsPercent: number;
  netPayableINR: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED';
}

const initialPayouts: PayoutRollup[] = [
  {
    id: 'pay-001',
    partnerName: 'Dr. Arvind Swamy (Geriatrician)',
    category: 'DOCTOR',
    billingMonth: 'August 2026',
    completedUnits: 14,
    unitRateINR: 1200,
    grossAmountINR: 16800,
    tdsPercent: 10,
    netPayableINR: 15120,
    status: 'PENDING_APPROVAL',
  },
  {
    id: 'pay-002',
    partnerName: 'MedPlus Advanced ALS Ambulance #14',
    category: 'AMBULANCE',
    billingMonth: 'August 2026',
    completedUnits: 6,
    unitRateINR: 2500,
    grossAmountINR: 15000,
    tdsPercent: 2,
    netPayableINR: 14700,
    status: 'APPROVED',
  },
  {
    id: 'pay-003',
    partnerName: 'Apollo Diagnostics Mobile Phlebotomy',
    category: 'DIAGNOSTICS',
    billingMonth: 'August 2026',
    completedUnits: 28,
    unitRateINR: 350,
    grossAmountINR: 9800,
    tdsPercent: 2,
    netPayableINR: 9604,
    status: 'PENDING_APPROVAL',
  },
];

export const PayoutStatementTable: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRollup[]>(initialPayouts);

  const handleApproveBatch = () => {
    setPayouts((prev) => prev.map((p) => ({ ...p, status: 'APPROVED' })));
  };

  const handleExportCsv = () => {
    const headers = 'ID,Partner,Category,Month,Units,GrossINR,TDS,NetPayableINR,Status\\n';
    const rows = payouts.map(p => \`\${p.id},\${p.partnerName},\${p.category},\${p.billingMonth},\${p.completedUnits},\${p.grossAmountINR},\${p.tdsPercent}%,\${p.netPayableINR},\${p.status}\`).join('\\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`pococare-partner-payouts-aug-2026.csv\`;
    a.click();
  };

  const totalGross = payouts.reduce((acc, p) => acc + p.grossAmountINR, 0);
  const totalNet = payouts.reduce((acc, p) => acc + p.netPayableINR, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Gross Partner Consumption</span>
          <span className="text-2xl font-black text-slate-900">₹{totalGross.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Net Payable (Post-TDS)</span>
          <span className="text-2xl font-black text-brand-600">₹{totalNet.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Reconciliation Status</span>
          <span className="text-2xl font-black text-slate-900">August 2026 Rollup</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-black text-slate-900 m-0">Monthly Payout Statements</h3>

        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm"
          >
            <Download size={14} />
            <span>Download GST CSV</span>
          </button>

          <button
            onClick={handleApproveBatch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600"
          >
            <CheckCircle2 size={15} />
            <span>1-Click Batch Approve All</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Partner Provider</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Completed Volume</th>
              <th className="py-3.5 px-4">Gross (INR)</th>
              <th className="py-3.5 px-4">TDS (%)</th>
              <th className="py-3.5 px-4">Net Payable</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.partnerName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {p.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-700">{p.completedUnits} Visits/Trips</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">₹{p.grossAmountINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-slate-500">{p.tdsPercent}%</td>
                <td className="py-3.5 px-4 font-black text-brand-600">₹{p.netPayableINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={\`text-[10px] font-extrabold px-2.5 py-1 rounded-full border \${
                      p.status === 'APPROVED'
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-secondary-50 text-secondary-700 border-secondary-200'
                    }\`}
                  >
                    {p.status}
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

console.log('Finished retheme part 3');

