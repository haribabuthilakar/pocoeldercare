import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Save,
} from 'lucide-react';

export interface VitalsData {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  bloodSugar?: number;
  spo2?: number;
  temperature?: number;
  notes?: string;
}

export interface VitalsEntryFormProps {
  initialVitals?: VitalsData;
  onSaveVitals: (vitals: VitalsData) => Promise<void>;
  isSaving?: boolean;
}

export function evaluateVitalsRange(vitals: VitalsData): {
  bpStatus: 'normal' | 'high' | 'low' | 'none';
  pulseStatus: 'normal' | 'high' | 'low' | 'none';
  sugarStatus: 'normal' | 'high' | 'low' | 'none';
  spo2Status: 'normal' | 'warning' | 'critical' | 'none';
  tempStatus: 'normal' | 'high' | 'none';
} {
  let bpStatus: 'normal' | 'high' | 'low' | 'none' = 'none';
  if (vitals.bpSystolic !== undefined && vitals.bpDiastolic !== undefined) {
    if (vitals.bpSystolic > 140 || vitals.bpDiastolic > 90) bpStatus = 'high';
    else if (vitals.bpSystolic < 90 || vitals.bpDiastolic < 60) bpStatus = 'low';
    else bpStatus = 'normal';
  }

  let pulseStatus: 'normal' | 'high' | 'low' | 'none' = 'none';
  if (vitals.pulse !== undefined) {
    if (vitals.pulse > 100) pulseStatus = 'high';
    else if (vitals.pulse < 60) pulseStatus = 'low';
    else pulseStatus = 'normal';
  }

  let sugarStatus: 'normal' | 'high' | 'low' | 'none' = 'none';
  if (vitals.bloodSugar !== undefined) {
    if (vitals.bloodSugar > 140) sugarStatus = 'high';
    else if (vitals.bloodSugar < 70) sugarStatus = 'low';
    else sugarStatus = 'normal';
  }

  let spo2Status: 'normal' | 'warning' | 'critical' | 'none' = 'none';
  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 90) spo2Status = 'critical';
    else if (vitals.spo2 < 95) spo2Status = 'warning';
    else spo2Status = 'normal';
  }

  let tempStatus: 'normal' | 'high' | 'none' = 'none';
  if (vitals.temperature !== undefined) {
    if (vitals.temperature > 99.0) tempStatus = 'high';
    else tempStatus = 'normal';
  }

  return { bpStatus, pulseStatus, sugarStatus, spo2Status, tempStatus };
}

export const VitalsEntryForm: React.FC<VitalsEntryFormProps> = ({
  initialVitals,
  onSaveVitals,
  isSaving = false,
}) => {
  const [systolic, setSystolic] = useState<string>(
    initialVitals?.bpSystolic ? String(initialVitals.bpSystolic) : '',
  );
  const [diastolic, setDiastolic] = useState<string>(
    initialVitals?.bpDiastolic ? String(initialVitals.bpDiastolic) : '',
  );
  const [pulse, setPulse] = useState<string>(
    initialVitals?.pulse ? String(initialVitals.pulse) : '',
  );
  const [bloodSugar, setBloodSugar] = useState<string>(
    initialVitals?.bloodSugar ? String(initialVitals.bloodSugar) : '',
  );
  const [spo2, setSpo2] = useState<string>(
    initialVitals?.spo2 ? String(initialVitals.spo2) : '',
  );
  const [temperature, setTemperature] = useState<string>(
    initialVitals?.temperature ? String(initialVitals.temperature) : '',
  );
  const [notes, setNotes] = useState<string>(initialVitals?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const vitalsObj: VitalsData = {
    bpSystolic: systolic ? Number(systolic) : undefined,
    bpDiastolic: diastolic ? Number(diastolic) : undefined,
    pulse: pulse ? Number(pulse) : undefined,
    bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
    spo2: spo2 ? Number(spo2) : undefined,
    temperature: temperature ? Number(temperature) : undefined,
    notes: notes || undefined,
  };

  const ranges = evaluateVitalsRange(vitalsObj);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveVitals(vitalsObj);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="vitals-entry-form"
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinical Vitals Measurement</h3>
            <p className="text-xs text-slate-500">Record baseline senior physiological readings</p>
          </div>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Blood Pressure (Systolic / Diastolic) */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Blood Pressure (mmHg)
            </label>
            {ranges.bpStatus !== 'none' && (
              <span
                data-testid="bp-status-badge"
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  ranges.bpStatus === 'normal'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {ranges.bpStatus === 'normal' ? 'Normal (120/80)' : 'Out of Normal Range'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              data-testid="vitals-systolic-input"
              placeholder="Systolic (e.g. 120)"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="number"
              data-testid="vitals-diastolic-input"
              placeholder="Diastolic (e.g. 80)"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Pulse / Heart Rate */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              Pulse (bpm)
            </label>
            {ranges.pulseStatus !== 'none' && (
              <span
                data-testid="pulse-status-badge"
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ranges.pulseStatus === 'normal'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {ranges.pulseStatus === 'normal' ? '60-100' : 'Elevated'}
              </span>
            )}
          </div>
          <input
            type="number"
            data-testid="vitals-pulse-input"
            placeholder="e.g. 72"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Blood Sugar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Blood Sugar (mg/dL)
            </label>
            {ranges.sugarStatus !== 'none' && (
              <span
                data-testid="sugar-status-badge"
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ranges.sugarStatus === 'normal'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {ranges.sugarStatus === 'normal' ? 'Normal' : 'High'}
              </span>
            )}
          </div>
          <input
            type="number"
            data-testid="vitals-sugar-input"
            placeholder="e.g. 110"
            value={bloodSugar}
            onChange={(e) => setBloodSugar(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* SpO2 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-500" />
              SpO2 Oxygen (%)
            </label>
            {ranges.spo2Status !== 'none' && (
              <span
                data-testid="spo2-status-badge"
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ranges.spo2Status === 'normal'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {ranges.spo2Status === 'normal' ? '≥95%' : 'Low Oxygen'}
              </span>
            )}
          </div>
          <input
            type="number"
            data-testid="vitals-spo2-input"
            placeholder="e.g. 98"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              Temperature (°F)
            </label>
            {ranges.tempStatus !== 'none' && (
              <span
                data-testid="temp-status-badge"
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ranges.tempStatus === 'normal'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {ranges.tempStatus === 'normal' ? 'Normal' : 'Fever'}
              </span>
            )}
          </div>
          <input
            type="number"
            step="0.1"
            data-testid="vitals-temp-input"
            placeholder="e.g. 98.6"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Observations */}
      <div>
        <label htmlFor="clinicalNotes" className="block text-xs font-semibold text-slate-700 mb-1">
          Clinical Notes / Symptoms:
        </label>
        <textarea
          id="clinicalNotes"
          data-testid="vitals-notes-input"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Senior took morning breakfast, resting comfortably..."
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Save Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {savedSuccess ? 'Vitals saved to local database!' : 'Physiological range checks applied'}
        </span>

        <button
          type="submit"
          data-testid="save-vitals-button"
          disabled={isSaving}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Vitals'}</span>
        </button>
      </div>
    </form>
  );
};
export default VitalsEntryForm;
