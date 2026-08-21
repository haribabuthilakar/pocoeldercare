'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Hospital, ShieldAlert, Home, AlertTriangle, FileText } from 'lucide-react';

export type ResolutionState =
  | 'RESOLVED_AT_HOME'
  | 'HOSPITALIZED_AND_ADMITTED'
  | 'SPECIALIST_TRANSFER'
  | 'FALSE_ALARM_SOS';

export const IncidentClosureModal: React.FC<{
  incidentId: string;
  seniorName: string;
  isOpen: boolean;
  onClose: () => void;
  onClosed: (payload: {
    state: ResolutionState;
    hospitalName: string;
    doctorName: string;
    clinicalSummary: string;
    followUpDate: string;
  }) => void;
}> = ({ incidentId, seniorName, isOpen, onClose, onClosed }) => {
  const [state, setState] = useState<ResolutionState>('RESOLVED_AT_HOME');
  const [hospitalName, setHospitalName] = useState('Manipal Hospital Old Airport Rd');
  const [doctorName, setDoctorName] = useState('Dr. Arvind Narayanan (ER Consultant)');
  const [clinicalSummary, setClinicalSummary] = useState(
    'Senior stabilized on-ground by attending Care Officer. Vitals normal, ECG rhythm sinus. Family notified.'
  );
  const [followUpDate, setFollowUpDate] = useState('2026-08-22');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClosed({
      state,
      hospitalName,
      doctorName,
      clinicalSummary,
      followUpDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                Close Emergency Event & Log Outcome
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0">
                Incident #{incidentId} • Patient: {seniorName}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {/* 4-State Selection Grid */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block">
              Select Final Resolution State:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setState('RESOLVED_AT_HOME')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  state === 'RESOLVED_AT_HOME'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Home size={18} className="text-brand-600" />
                <span>Resolved at Home</span>
              </div>

              <div
                onClick={() => setState('HOSPITALIZED_AND_ADMITTED')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  state === 'HOSPITALIZED_AND_ADMITTED'
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Hospital size={18} className="text-secondary-600" />
                <span>Hospitalized & Admitted</span>
              </div>

              <div
                onClick={() => setState('SPECIALIST_TRANSFER')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  state === 'SPECIALIST_TRANSFER'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <FileText size={18} className="text-blue-600" />
                <span>Specialist Transfer</span>
              </div>

              <div
                onClick={() => setState('FALSE_ALARM_SOS')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  state === 'FALSE_ALARM_SOS'
                    ? 'border-slate-800 bg-slate-100 text-slate-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <AlertTriangle size={18} className="text-slate-600" />
                <span>False Alarm / Accidental</span>
              </div>
            </div>
          </div>

          {/* Conditional Clinical Hospital Fields */}
          {(state === 'HOSPITALIZED_AND_ADMITTED' || state === 'SPECIALIST_TRANSFER') && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Attending Hospital Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-brand-500"
                  required
                />
              </div>
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Admitting ER Doctor</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-brand-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Clinical Summary & Notes */}
          <div>
            <label className="font-extrabold text-slate-700 block mb-1">
              Clinical Outcome & Stabilization Summary (Mandatory)
            </label>
            <textarea
              rows={3}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-brand-500"
              required
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="font-extrabold text-slate-700 block mb-1">
              Scheduled Care Officer In-Person Follow-up
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-brand-500"
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Outcome logs into weekly SLA rollup.</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-xs transition-colors"
              >
                Confirm Incident Closure
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
