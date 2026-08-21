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
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-black text-slate-900">{fleet.name}</strong>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isTier1
                            ? 'bg-brand-50 text-brand-700 border-brand-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
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
                      {fleet.distanceKm} km away • {fleet.rateInr === 0 ? 'Free (Govt)' : `₹${fleet.rateInr}`}
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
