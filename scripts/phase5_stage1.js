const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. EMERGENCY SCREEN POP MODAL (EMG-01, EMG-02)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/emergency-screen-pop.tsx', `
'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Hospital,
  Clock,
  User,
  X,
  Volume2,
  CheckCircle2,
  MapPin,
  Ambulance,
  Phone
} from 'lucide-react';

export interface EmergencyCallerContext {
  incidentId: string;
  callerPhone: string;
  sourceType: 'INBOUND_PSTN' | 'SOS_PENDANT_FALL' | 'CAREGIVER_PANIC';
  callDurationSeconds: number;
  householdId: string;
  householdName: string;
  address: string;
  city: string;
  primarySenior: {
    id: string;
    name: string;
    age: number;
    bloodGroup: string;
    chronicConditions: string[];
    allergies: string[];
    preferredHospital: string;
    erPhone: string;
    primaryPhysician: string;
    nriSponsorName: string;
    nriSponsorPhone: string;
    nriSponsorRelation: string;
    nriTimezone: string;
  };
  otherSeniors: {
    id: string;
    name: string;
    age: number;
    bloodGroup: string;
    chronicConditions: string[];
    allergies: string[];
  }[];
}

export const EmergencyScreenPop: React.FC<{
  caller: EmergencyCallerContext;
  isOpen: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  onTriggerAmbulance: () => void;
}> = ({ caller, isOpen, onAccept, onDismiss, onTriggerAmbulance }) => {
  const [selectedSeniorId, setSelectedSeniorId] = useState(caller.primarySenior.id);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const currentSenior =
    caller.primarySenior.id === selectedSeniorId
      ? caller.primarySenior
      : caller.otherSeniors.find((s) => s.id === selectedSeniorId) || caller.primarySenior;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white border-2 border-secondary-500 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] glow-secondary">
        {/* Urgent Header Banner */}
        <div className="p-5 bg-secondary-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black animate-bounce">
              <PhoneCall size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight m-0">
                  INCOMING 24X7 EMERGENCY HELPLINE CALL
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-secondary-600 uppercase">
                  SUB-2S ICE RETRIEVED
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium m-0 flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold">{caller.callerPhone}</span>
                <span>•</span>
                <span>{caller.householdName} ({caller.city})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-mono font-black text-xs flex items-center gap-1.5">
              <Clock size={14} className="animate-spin" />
              <span>00:{elapsedSeconds < 10 ? '0' : ''}{elapsedSeconds}s Call Active</span>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Multi-Senior Disambiguation Tabs */}
        {caller.otherSeniors.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-2">
              Select Household Senior:
            </span>
            <button
              onClick={() => setSelectedSeniorId(caller.primarySenior.id)}
              className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${
                selectedSeniorId === caller.primarySenior.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }\`}
            >
              ★ {caller.primarySenior.name} ({caller.primarySenior.age}y)
            </button>
            {caller.otherSeniors.map((os) => (
              <button
                key={os.id}
                onClick={() => setSelectedSeniorId(os.id)}
                className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${
                  selectedSeniorId === os.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }\`}
              >
                {os.name} ({os.age}y)
              </button>
            ))}
          </div>
        )}

        {/* Main ICE Medical & Emergency Telemetry Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Senior Profile & Blood Group Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-1">
              <span className="text-[10px] font-black text-brand-700 uppercase tracking-wider">Patient Identity</span>
              <h4 className="text-base font-black text-slate-900 m-0">{currentSenior.name}</h4>
              <span className="text-xs text-slate-600 font-bold">{currentSenior.age} years old</span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 space-y-1">
              <span className="text-[10px] font-black text-secondary-600 uppercase tracking-wider">Blood Group & Allergies</span>
              <h4 className="text-base font-black text-secondary-600 m-0">Blood Group: {currentSenior.bloodGroup}</h4>
              <span className="text-xs text-slate-700 font-bold">
                Allergies: {currentSenior.allergies.join(', ') || 'None Known'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Preferred Trauma ER</span>
              <h4 className="text-sm font-extrabold text-slate-900 m-0">{caller.primarySenior.preferredHospital}</h4>
              <a
                href={\`tel:\${caller.primarySenior.erPhone}\`}
                className="text-xs font-black text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone size={11} />
                <span>Direct ER: {caller.primarySenior.erPhone}</span>
              </a>
            </div>
          </div>

          {/* Chronic Conditions & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse size={14} className="text-brand-600" />
                <span>Known Chronic Conditions & Baseline</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {currentSenior.chronicConditions.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-secondary-600" />
                <span>Residence Location & GPS Lock</span>
              </h5>
              <p className="text-xs text-slate-700 font-bold m-0">{caller.address}</p>
              <span className="text-[11px] text-slate-500 font-medium">GPS Accuracy: 4.2m radius</span>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onAccept}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>Accept & Lock Dispatcher Incident</span>
            </button>

            <button
              onClick={onTriggerAmbulance}
              className="px-5 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs glow-secondary transition-all flex items-center gap-2"
            >
              <Ambulance size={15} />
              <span>1-Click Tiered Ambulance Dispatch</span>
            </button>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            SLA Standard: Response in &lt;15m
          </span>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. TIERED AMBULANCE DISPATCH MODAL (EMG-03)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/ambulance-dispatch-modal.tsx', `
'use client';

import React, { useState } from 'react';
import { X, Ambulance, ShieldCheck, Phone, CheckCircle2, AlertOctagon, Clock, MapPin } from 'lucide-react';

export interface AmbulanceFleetProvider {
  id: string;
  name: string;
  tier: 'TIER_1_PRIVATE_ALS' | 'TIER_2_GOVT_108';
  vehicleType: 'ALS_CARDIAC_AMBULANCE' | 'BLS_EMERGENCY_VAN';
  distanceKm: number;
  etaMinutes: number;
  rateInr: number;
  phone: string;
  driverName: string;
  isAvailable: boolean;
}

const mockFleets: AmbulanceFleetProvider[] = [
  {
    id: 'amb-01',
    name: 'Apollo ALS Cardiac Life Support Fleet',
    tier: 'TIER_1_PRIVATE_ALS',
    vehicleType: 'ALS_CARDIAC_AMBULANCE',
    distanceKm: 3.2,
    etaMinutes: 11,
    rateInr: 2500,
    phone: '+91 80 2502 9999',
    driverName: 'Ranganath (ALS Paramedic on Board)',
    isAvailable: true,
  },
  {
    id: 'amb-02',
    name: 'Manipal Critical Trauma Response Unit',
    tier: 'TIER_1_PRIVATE_ALS',
    vehicleType: 'ALS_CARDIAC_AMBULANCE',
    distanceKm: 4.8,
    etaMinutes: 14,
    rateInr: 2500,
    phone: '+91 80 2502 4444',
    driverName: 'Pradeep Gowda',
    isAvailable: true,
  },
  {
    id: 'amb-03',
    name: 'Govt 108 Emergency Ambulance Network',
    tier: 'TIER_2_GOVT_108',
    vehicleType: 'BLS_EMERGENCY_VAN',
    distanceKm: 2.5,
    etaMinutes: 18,
    rateInr: 0,
    phone: '108',
    driverName: 'State Central Emergency Dispatch',
    isAvailable: true,
  },
];

export const AmbulanceDispatchModal: React.FC<{
  isOpen: boolean;
  seniorName: string;
  address: string;
  onClose: () => void;
  onDispatched: (fleet: AmbulanceFleetProvider) => void;
}> = ({ isOpen, seniorName, address, onClose, onDispatched }) => {
  const [selectedFleetId, setSelectedFleetId] = useState<string>(mockFleets[0].id);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const fleet = mockFleets.find((f) => f.id === selectedFleetId) || mockFleets[0];
    setIsDispatched(true);
    setTimeout(() => {
      onDispatched(fleet);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
              <Ambulance size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                Tiered Ambulance Dispatch Coordination
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0">
                Patient: {seniorName} • Destination ER Handover
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Fleet Selection List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {mockFleets.map((fleet) => {
            const isSelected = selectedFleetId === fleet.id;
            const isTier1 = fleet.tier === 'TIER_1_PRIVATE_ALS';

            return (
              <div
                key={fleet.id}
                onClick={() => setSelectedFleetId(fleet.id)}
                className={\`p-4 rounded-2xl border-2 transition-all cursor-pointer \${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }\`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-black text-slate-900">{fleet.name}</strong>
                      <span
                        className={\`text-[10px] font-black px-2 py-0.5 rounded-full border \${
                          isTier1
                            ? 'bg-brand-50 text-brand-700 border-brand-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }\`}
                      >
                        {isTier1 ? 'Tier 1: Private ALS' : 'Tier 2: 108 Fallback'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                      {fleet.driverName} • Phone: {fleet.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-brand-600 flex items-center gap-1 justify-end font-mono">
                      <Clock size={13} />
                      <span>{fleet.etaMinutes}m ETA</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold block">
                      {fleet.distanceKm} km away • {fleet.rateInr === 0 ? 'Free (Govt)' : \`₹\${fleet.rateInr}\`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirmation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Auto-notifies trauma ER reception on dispatch confirmation.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs glow-secondary transition-all flex items-center gap-2"
            >
              <Ambulance size={15} />
              <span>{isDispatched ? 'Ambulance Dispatched!' : 'Confirm 1-Click Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. CLINICAL HOSPITAL PRE-BRIEF SHEET & PDF GENERATOR (EMG-03)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dispatcher/hospital-prebrief-sheet.tsx', `
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
`);

console.log('Finished Phase 5 Stage 1: Screen Pop, Ambulance Dispatch, and Hospital Pre-Brief');

