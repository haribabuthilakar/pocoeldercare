'use client';

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
        id: `step-${Date.now()}`,
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
    const newVersion = `v${maj}.${min + 1}.0`;
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
