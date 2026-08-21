const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. SLA COUNTDOWN TRACKER & BREACH ALERT (EMG-04)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/sla-countdown-tracker.tsx', `
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export interface SlaTarget {
  name: string;
  targetSeconds: number;
  elapsedSeconds: number;
  status: 'SAFE' | 'WARNING' | 'BREACHED';
}

export const SlaCountdownTracker: React.FC<{
  incidentStartTime: Date;
  onBreachAlert?: () => void;
}> = ({ incidentStartTime, onBreachAlert }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ambulanceTargetSeconds = 15 * 60; // 15 mins (Golden Hour arrival)
  const remainingSeconds = Math.max(0, ambulanceTargetSeconds - totalSeconds);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return \`\${m < 10 ? '0' : ''}\${m}:\${s < 10 ? '0' : ''}\${s}\`;
  };

  const isWarning = remainingSeconds <= 3 * 60 && remainingSeconds > 0;
  const isBreached = remainingSeconds === 0;

  return (
    <div className={\`p-4 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 \${
      isBreached
        ? 'bg-secondary-50 border-secondary-300 text-secondary-900 glow-secondary'
        : isWarning
        ? 'bg-amber-50 border-amber-300 text-amber-900'
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }\`}>
      <div className="flex items-center gap-3">
        <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center font-black \${
          isBreached
            ? 'bg-secondary-500 text-white animate-pulse'
            : isWarning
            ? 'bg-amber-500 text-white'
            : 'bg-brand-50 text-brand-600'
        }\`}>
          <Clock size={20} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Published Golden Hour SLA (15m Target)
          </span>
          <div className="flex items-center gap-2">
            <strong className="text-xl font-black font-mono tracking-tight">
              {formatMinSec(remainingSeconds)}
            </strong>
            <span className={\`text-[10px] font-black px-2 py-0.5 rounded-full uppercase \${
              isBreached
                ? 'bg-secondary-500 text-white'
                : isWarning
                ? 'bg-amber-500 text-white'
                : 'bg-brand-50 text-brand-700'
            }\`}>
              {isBreached ? '🚨 SLA BREACHED — SUPERVISOR ALERTED' : isWarning ? '⚠️ WARNING: <3M REMAINING' : 'ON TRACK'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">ICE Lookup</span>
          <strong className="text-slate-800 font-bold">1.2s (&lt;2s)</strong>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">CTI Pickup</span>
          <strong className="text-slate-800 font-bold">4.8s (&lt;10s)</strong>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">Ambulance Dispatch</span>
          <strong className="text-brand-600 font-bold">1m 42s (&lt;3m)</strong>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. TIMEZONE-AWARE FAMILY ESCALATION CALL TREE (EMG-05)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/family-escalation-panel.tsx', `
'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Clock, Globe, ShieldAlert, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export interface FamilyContactNode {
  id: string;
  name: string;
  relation: string;
  phone: string;
  timezone: string; // e.g. "America/Los_Angeles", "Europe/London", "Asia/Kolkata"
  localTimeDisplay: string;
  isNighttime: boolean;
  status: 'PENDING' | 'RINGING' | 'ACKNOWLEDGED' | 'TIMEOUT_ESCALATED';
}

export const FamilyEscalationPanel: React.FC<{
  incidentId: string;
  contacts: FamilyContactNode[];
}> = ({ incidentId, contacts }) => {
  const [contactList, setContactList] = useState<FamilyContactNode[]>(contacts);
  const [activeCallIndex, setActiveCallIndex] = useState(0);
  const [countdown, setCountdown] = useState(180); // 3 minutes timeout

  useEffect(() => {
    if (activeCallIndex >= contactList.length) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Timeout: escalate to next
          setContactList((prev) =>
            prev.map((contact, idx) =>
              idx === activeCallIndex ? { ...contact, status: 'TIMEOUT_ESCALATED' } : contact
            )
          );
          setActiveCallIndex((prevIdx) => prevIdx + 1);
          return 180;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCallIndex, contactList.length]);

  const handleAcknowledge = (id: string) => {
    setContactList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'ACKNOWLEDGED' } : c))
    );
  };

  const handleTriggerManualCall = (id: string) => {
    setContactList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'RINGING' } : c))
    );
  };

  return (
    <div className="bento-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 m-0">
              Timezone-Aware Family Escalation Call Tree
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Sequential 3-minute timeout with dual WhatsApp & IVR voice alerts
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center gap-1.5">
          <MessageSquare size={13} />
          <span>WhatsApp & SMS Dispatched Instantly</span>
        </div>
      </div>

      {/* Contact Tree Nodes */}
      <div className="space-y-3 pt-2">
        {contactList.map((contact, idx) => {
          const isCurrentActive = idx === activeCallIndex && contact.status !== 'ACKNOWLEDGED';

          return (
            <div
              key={contact.id}
              className={\`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 \${
                contact.status === 'ACKNOWLEDGED'
                  ? 'bg-brand-50/60 border-brand-200'
                  : isCurrentActive
                  ? 'bg-secondary-50/40 border-secondary-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }\`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={\`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black \${
                    contact.status === 'ACKNOWLEDGED'
                      ? 'bg-brand-500 text-white'
                      : isCurrentActive
                      ? 'bg-secondary-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }\`}
                >
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-black text-slate-900">{contact.name}</strong>
                    <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {contact.relation}
                    </span>
                    {contact.isNighttime && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        🌙 Local Nighttime ({contact.localTimeDisplay})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono m-0 mt-0.5">
                    {contact.phone} • {contact.timezone} ({contact.localTimeDisplay})
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-3">
                {contact.status === 'ACKNOWLEDGED' && (
                  <span className="text-xs font-black text-brand-600 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Acknowledged by Family</span>
                  </span>
                )}

                {contact.status === 'TIMEOUT_ESCALATED' && (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    <span>Unanswered (Escalated)</span>
                  </span>
                )}

                {isCurrentActive && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono font-bold text-secondary-600 flex items-center gap-1">
                      <Clock size={13} className="animate-spin" />
                      <span>Ringing... ({countdown}s left)</span>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(contact.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold transition-colors shadow-xs"
                    >
                      Mark Acknowledged
                    </button>
                  </div>
                )}

                {contact.status === 'PENDING' && !isCurrentActive && (
                  <button
                    onClick={() => handleTriggerManualCall(contact.id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Force Dial
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. 4-STATE INCIDENT CLOSURE MODAL (EMG-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/incident-closure-modal.tsx', `
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
                className={\`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 \${
                  state === 'RESOLVED_AT_HOME'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }\`}
              >
                <Home size={18} className="text-brand-600" />
                <span>Resolved at Home</span>
              </div>

              <div
                onClick={() => setState('HOSPITALIZED_AND_ADMITTED')}
                className={\`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 \${
                  state === 'HOSPITALIZED_AND_ADMITTED'
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }\`}
              >
                <Hospital size={18} className="text-secondary-600" />
                <span>Hospitalized & Admitted</span>
              </div>

              <div
                onClick={() => setState('SPECIALIST_TRANSFER')}
                className={\`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 \${
                  state === 'SPECIALIST_TRANSFER'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }\`}
              >
                <FileText size={18} className="text-blue-600" />
                <span>Specialist Transfer</span>
              </div>

              <div
                onClick={() => setState('FALSE_ALARM_SOS')}
                className={\`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 \${
                  state === 'FALSE_ALARM_SOS'
                    ? 'border-slate-800 bg-slate-100 text-slate-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }\`}
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
`);

console.log('Finished Phase 5 Stage 2: SLA Tracker, Family Call Tree, and Incident Closure');

