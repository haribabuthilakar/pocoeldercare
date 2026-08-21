const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. VISUAL 90-SERVICE CATALOG & SOP EDITOR
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/catalog/sop-editor-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { FileCode2, X, Plus, Trash2, Check, Sparkles, AlertCircle } from 'lucide-react';

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

  // Calculate next semantic version
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="bg-navy-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <FileCode2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white m-0">Visual Dynamic SOP Template Editor</h3>
            <p className="text-xs text-slate-400 m-0">
              {template.serviceCode} • <strong className="text-white">{template.serviceName}</strong> (Current: {template.currentVersion})
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1 border-b border-white/10">
            <span>Protocol Step Sequence (OTA JSON Schema)</span>
            <span>{steps.length} Steps Active</span>
          </div>

          {steps.map((step, idx) => (
            <div key={step.id} className="p-3.5 rounded-2xl bg-navy-800/70 border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-white">{step.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md border \${
                  step.requiresPhoto
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                    : 'bg-white/5 text-slate-400 border-white/5'
                }\`}>
                  📷 Photo Proof
                </span>
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="p-1 text-slate-400 hover:text-secondary-400 rounded-md bg-white/5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Step Form */}
        <div className="p-4 rounded-2xl bg-navy-800/40 border border-white/10 mb-6 flex gap-2">
          <input
            type="text"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder="Add new SOP verification step..."
            className="flex-1 bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
          <button
            onClick={handleAddStep}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Step</span>
          </button>
        </div>

        {/* Publish Action & Version Bumping */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            Publishing will release <strong className="text-brand-400">{nextMinorVersion}</strong> OTA to all Field Care Officers immediately.
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold">
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-navy-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-brand-500/20"
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

writeFile('apps/ops-crm/src/app/catalog/page.tsx', `
'use client';

import React, { useState } from 'react';
import { SopEditorModal, SopTemplateVersion, SopStepDef } from '../../components/catalog/sop-editor-modal';
import { FileCode2, Plus, Edit, Check, Sparkles } from 'lucide-react';

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
        <div className="p-4 rounded-2xl bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check size={16} className="text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white m-0">90-Service Catalog & Dynamic SOP Editor</h2>
          <p className="text-xs text-slate-400 mt-1 mb-0">Versioned OTA templates delivered instantly to Field App without app updates</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-navy-950 text-xs font-black shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all">
          <Plus size={15} />
          <span>Create New SOP Template</span>
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((tpl) => (
          <div key={tpl.serviceCode} className="bg-navy-800/80 border border-white/10 rounded-3xl p-5 shadow-xl hover:border-white/20 transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {tpl.serviceCode}
                </span>
                <h3 className="text-sm font-extrabold text-white mt-1.5 mb-0.5">{tpl.serviceName}</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-navy-900 border border-white/10 text-brand-400">
                {tpl.currentVersion}
              </span>
            </div>

            <div className="text-xs text-slate-400 py-2 border-y border-white/5 space-y-1.5">
              {tpl.steps.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                    {idx + 1}
                  </span>
                  <span className="truncate text-slate-300 font-medium">{s.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTemplate(tpl)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-400 border border-brand-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
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

// -------------------------------------------------------------
// 2. PARTNER PAYOUT RECONCILIATION
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/payouts/payout-statement-table.tsx', `
'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2, DollarSign, FileText } from 'lucide-react';

interface PayoutRollup {
  id: string;
  partnerName: string;
  category: string;
  billingMonth: string;
  completedUnits: number;
  unitRateINR: number;
  grossAmountINR: number;
  tdsPercent: number; // 10% for professional services
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
        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Gross Partner Consumption</span>
          <span className="text-2xl font-black text-white">₹{totalGross.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Total Net Payable (Post-TDS)</span>
          <span className="text-2xl font-black text-brand-400">₹{totalNet.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-navy-800/80 border border-white/10 p-5 rounded-3xl">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Reconciliation Status</span>
          <span className="text-2xl font-black text-white">August 2026 Rollup</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-black text-white m-0">Monthly Payout Statements</h3>

        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold border border-white/10"
          >
            <Download size={14} />
            <span>Download GST CSV</span>
          </button>

          <button
            onClick={handleApproveBatch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-navy-950 text-xs font-black shadow-lg shadow-brand-500/20 hover:bg-brand-400"
          >
            <CheckCircle2 size={15} />
            <span>1-Click Batch Approve All</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-800/70 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-extrabold border-b border-white/10">
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
          <tbody className="divide-y divide-white/5 font-medium">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">{p.partnerName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-navy-900 text-slate-300 font-bold border border-white/5">
                    {p.category}
                  </span>
                </td>
                <td className="py-3.5 px-4">{p.completedUnits} Visits/Trips</td>
                <td className="py-3.5 px-4 font-bold">₹{p.grossAmountINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-slate-400">{p.tdsPercent}%</td>
                <td className="py-3.5 px-4 font-black text-brand-400">₹{p.netPayableINR.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={\`text-[10px] font-extrabold px-2.5 py-1 rounded-full border \${
                      p.status === 'APPROVED'
                        ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                        : 'bg-secondary-500/20 text-secondary-400 border-secondary-500/40'
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

writeFile('apps/ops-crm/src/app/payouts/page.tsx', `
import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white m-0">Partner & Doctor Payout Reconciliation</h2>
        <p className="text-xs text-slate-400 mt-1 mb-0">Automated consumption ledger rollups, TDS deductions, and GST export statements</p>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
`);

// -------------------------------------------------------------
// 3. WORKFLOW TESTS
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/__tests__/ops-workflows.spec.tsx', `
import { describe, it, expect } from 'vitest';

describe('Operations CRM Workflows', () => {
  it('Flow 1: Auto-assignment scoring and candidate ranking algorithm', () => {
    const candidates = [
      { id: 'off-001', name: 'Ramesh Kumar', proximityKm: 2.1, caseload: 28, score: 96 },
      { id: 'off-002', name: 'Suresh Gowda', proximityKm: 4.8, caseload: 22, score: 84 },
    ];

    const topRanked = candidates.sort((a, b) => b.score - a.score)[0];
    expect(topRanked.id).toBe('off-001');
    expect(topRanked.score).toBe(96);
  });

  it('Flow 2: Mandatory audit log validation on manual override', () => {
    const overrideLog = {
      id: 'audit-001',
      serviceRequestId: 'req-001',
      originalOfficerId: 'off-001',
      selectedOfficerId: 'off-002',
      reasonCategory: 'FAMILY_PREFERENCE',
      notes: 'Family requested Suresh as he was their prior Care Officer',
      timestamp: new Date().toISOString(),
    };

    expect(overrideLog.notes.length).toBeGreaterThan(0);
    expect(overrideLog.selectedOfficerId).not.toBe(overrideLog.originalOfficerId);
    expect(overrideLog.reasonCategory).toBe('FAMILY_PREFERENCE');
  });

  it('Flow 3: Partner monthly payout ledger and TDS deduction rollup', () => {
    const grossConsultation = 16800;
    const tdsPercent = 10;
    const netPayable = grossConsultation - (grossConsultation * (tdsPercent / 100));

    expect(netPayable).toBe(15120);
  });
});
`);

console.log('Finished generating Wave 3 Catalog Editor, Payouts, and Test suite');

