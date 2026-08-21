'use client';

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
