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
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedSeniorId === caller.primarySenior.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              ★ {caller.primarySenior.name} ({caller.primarySenior.age}y)
            </button>
            {caller.otherSeniors.map((os) => (
              <button
                key={os.id}
                onClick={() => setSelectedSeniorId(os.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedSeniorId === os.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
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
                href={`tel:${caller.primarySenior.erPhone}`}
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
