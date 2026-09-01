import React from 'react';
import type { SeniorModel } from '../../db/models/senior';
import {
  ShieldAlert,
  Phone,
  Building2,
  AlertTriangle,
  Heart,
  Droplet,
  User,
} from 'lucide-react';

export interface EmergencyProfileCardProps {
  senior: SeniorModel;
  onCallContact?: (phone: string) => void;
}

export const EmergencyProfileCard: React.FC<EmergencyProfileCardProps> = ({
  senior,
  onCallContact,
}) => {
  const handleCall = (phone: string) => {
    onCallContact?.(phone);
  };

  return (
    <div
      data-testid="emergency-profile-card"
      className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden shadow-sm space-y-0"
    >
      {/* Red Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-100">
              Emergency ICE Profile
            </span>
            <h3 className="text-lg font-bold text-white leading-tight" data-testid="senior-name">
              {senior.fullName}
            </h3>
          </div>
        </div>

        {senior.bloodGroup && (
          <div
            data-testid="senior-blood-group"
            className="flex items-center gap-1 bg-white text-red-700 font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-xs"
          >
            <Droplet className="w-4 h-4 fill-red-600 text-red-600" />
            <span>{senior.bloodGroup}</span>
          </div>
        )}
      </div>

      {/* Profile Details Body */}
      <div className="p-5 space-y-4">
        {/* Allergies Notice */}
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Known Allergies & Clinical Alerts</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1" data-testid="senior-allergies-list">
            {senior.allergies.length > 0 ? (
              senior.allergies.map((allergy) => (
                <span
                  key={allergy}
                  data-testid={`allergy-chip-${allergy}`}
                  className="px-2 py-0.5 rounded-md bg-white border border-red-200 text-red-700 text-xs font-semibold"
                >
                  {allergy}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No known drug allergies on file</span>
            )}
          </div>
        </div>

        {/* Preferred Hospital */}
        {senior.preferredHospital && (
          <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 block">Preferred Emergency Hospital</span>
              <span className="text-slate-600" data-testid="senior-hospital">
                {senior.preferredHospital}
              </span>
            </div>
          </div>
        )}

        {/* 1-Tap Emergency Contacts */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Emergency Contacts (ICE)
          </span>

          {senior.emergencyContactPhone ? (
            <div
              data-testid="primary-ice-contact"
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {senior.emergencyContactName || 'Primary Family Contact'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {senior.emergencyContactPhone}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${senior.emergencyContactPhone}`}
                data-testid="ice-dial-button"
                onClick={(e) => {
                  if (onCallContact) {
                    e.preventDefault();
                    handleCall(senior.emergencyContactPhone!);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call ICE</span>
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No secondary emergency contact listed</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmergencyProfileCard;
