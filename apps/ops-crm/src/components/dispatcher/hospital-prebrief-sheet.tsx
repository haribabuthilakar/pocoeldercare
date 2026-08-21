'use client';

import React, { useState } from 'react';
import { FileText, Download, Mail, CheckCircle2, ShieldCheck, HeartPulse, AlertTriangle, Hospital, X } from 'lucide-react';

export interface PreBriefData {
  incidentId: string;
  seniorName: string;
  age: number;
  bloodGroup: string;
  chronicConditions: string[];
  allergies: string[];
  currentVitals: { bp: string; pulse: string; spo2: string; glucose: string };
  destinationHospital: string;
  dispatchedAmbulance: string;
  triageNotes: string;
  generatedAt: string;
}

export const HospitalPreBriefSheet: React.FC<{
  data: PreBriefData;
  isOpen: boolean;
  onClose: () => void;
}> = ({ data, isOpen, onClose }) => {
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black shadow-xs">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                Clinical Emergency Hospital Pre-Brief Sheet
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0">
                Standardized Trauma ER Handover Summary • Incident #{data.incidentId}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Printable Sheet Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong className="text-sm font-black text-slate-900 block">{data.seniorName}</strong>
              <span className="text-slate-500 font-bold">{data.age} yrs • Blood Group: {data.bloodGroup}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Destination ER</span>
              <strong className="text-xs font-black text-brand-700">{data.destinationHospital}</strong>
            </div>
          </div>

          {/* Vitals Telemetry */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
              <span className="text-[9px] text-brand-700 font-bold uppercase block">BP</span>
              <strong className="text-xs font-black font-mono">{data.currentVitals.bp}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
              <span className="text-[9px] text-brand-700 font-bold uppercase block">Pulse</span>
              <strong className="text-xs font-black font-mono">{data.currentVitals.pulse}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
              <span className="text-[9px] text-brand-700 font-bold uppercase block">SpO2</span>
              <strong className="text-xs font-black font-mono">{data.currentVitals.spo2}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
              <span className="text-[9px] text-brand-700 font-bold uppercase block">Blood Sugar</span>
              <strong className="text-xs font-black font-mono">{data.currentVitals.glucose}</strong>
            </div>
          </div>

          {/* Allergies & Triage Notes */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-black text-secondary-600 uppercase flex items-center gap-1.5">
              <AlertTriangle size={13} />
              <span>Critical Allergies / Contraindications</span>
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {data.allergies.map((a) => (
                <span key={a} className="px-2.5 py-1 rounded-lg bg-secondary-50 text-secondary-700 text-xs font-bold border border-secondary-200">
                  ⚠️ {a}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <h5 className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1.5">
              <HeartPulse size={13} className="text-brand-600" />
              <span>Attending Dispatcher Triage Notes</span>
            </h5>
            <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium m-0">
              {data.triageNotes}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Generated at {data.generatedAt}</span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Print Clinical PDF</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-xs glow-primary flex items-center gap-1.5 transition-all"
            >
              <Mail size={14} />
              <span>{emailSent ? '✓ Emailed to ER Reception!' : 'Dispatch Email to Hospital ER'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
