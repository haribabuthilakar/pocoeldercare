'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  ShieldAlert,
  Ambulance,
  HeartPulse,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  PhoneForwarded,
  Hospital,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { EmergencyScreenPop, EmergencyCallerContext } from '../../components/dispatcher/emergency-screen-pop';
import { AmbulanceDispatchModal, AmbulanceFleetProvider } from '../../components/dispatcher/ambulance-dispatch-modal';
import { HospitalPreBriefSheet, PreBriefData } from '../../components/dispatcher/hospital-prebrief-sheet';
import { SlaCountdownTracker } from '../../components/dispatcher/sla-countdown-tracker';
import { FamilyEscalationPanel, FamilyContactNode } from '../../components/dispatcher/family-escalation-panel';
import { IncidentClosureModal, ResolutionState } from '../../components/dispatcher/incident-closure-modal';

const mockCaller: EmergencyCallerContext = {
  incidentId: 'INC-2026-8801',
  callerPhone: '+91 98450 11999',
  sourceType: 'INBOUND_PSTN',
  callDurationSeconds: 42,
  householdId: 'hh-blr-001',
  householdName: 'Menon Residence',
  address: 'Flat 402, Palm Meadows, Whitefield, Bangalore 560066',
  city: 'Bangalore',
  primarySenior: {
    id: 'snr-001',
    name: 'Gopalakrishnan Menon',
    age: 78,
    bloodGroup: 'O+',
    chronicConditions: ['Severe Hypertension', 'Type 2 Diabetes', 'Previous TIA (2024)'],
    allergies: ['Penicillin', 'Sulfa Drugs'],
    preferredHospital: 'Manipal Hospital Old Airport Rd',
    erPhone: '+91 80 2502 4444',
    primaryPhysician: 'Dr. Arvind Narayanan (Geriatrician)',
    nriSponsorName: 'Divya Menon (Daughter)',
    nriSponsorPhone: '+1 408 555 0192',
    nriSponsorRelation: 'Daughter (Primary Sponsor)',
    nriTimezone: 'America/Los_Angeles (US PST)',
  },
  otherSeniors: [
    {
      id: 'snr-002',
      name: 'Kalyani Menon',
      age: 74,
      bloodGroup: 'B+',
      chronicConditions: ['Osteoarthritis', 'Mild Asthma'],
      allergies: ['Aspirin'],
    },
  ],
};

const mockFamilyContacts: FamilyContactNode[] = [
  {
    id: 'fam-1',
    name: 'Divya Menon',
    relation: 'Daughter (Primary Sponsor)',
    phone: '+1 408 555 0192',
    timezone: 'America/Los_Angeles',
    localTimeDisplay: '2:30 AM PST',
    isNighttime: true,
    status: 'RINGING',
  },
  {
    id: 'fam-2',
    name: 'Siddharth Menon',
    relation: 'Son (Secondary Sponsor)',
    phone: '+44 20 7946 0912',
    timezone: 'Europe/London',
    localTimeDisplay: '10:30 AM GMT',
    isNighttime: false,
    status: 'PENDING',
  },
  {
    id: 'fam-3',
    name: 'Brigadier Nair (Retd)',
    relation: 'Local Relative / Neighbor',
    phone: '+91 98450 44221',
    timezone: 'Asia/Kolkata',
    localTimeDisplay: '3:00 PM IST',
    isNighttime: false,
    status: 'PENDING',
  },
];

const mockPreBrief: PreBriefData = {
  incidentId: 'INC-2026-8801',
  seniorName: 'Gopalakrishnan Menon',
  age: 78,
  bloodGroup: 'O+',
  chronicConditions: ['Severe Hypertension', 'Type 2 Diabetes', 'Previous TIA (2024)'],
  allergies: ['Penicillin', 'Sulfa Drugs'],
  currentVitals: { bp: '168/98 mmHg', pulse: '102 bpm', spo2: '93%', glucose: '184 mg/dL' },
  destinationHospital: 'Manipal Hospital Old Airport Rd (Trauma ER)',
  dispatchedAmbulance: 'Apollo ALS Cardiac Life Support Fleet (Driver: Ranganath)',
  triageNotes: 'Sudden onset slurred speech and left-sided mild weakness reported by elder. BLS/ALS ambulance en route. Golden Hour priority dispatch.',
  generatedAt: '2026-08-21 15:00 IST',
};

export default function DispatcherPage() {
  const [isScreenPopOpen, setIsScreenPopOpen] = useState(false);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [isPreBriefOpen, setIsPreBriefOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [incidentState, setIncidentState] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [dispatchedAmbulanceName, setDispatchedAmbulanceName] = useState('Apollo ALS Cardiac Unit (ETA 11m)');

  const handleTriggerSimulatedCall = () => {
    setIsScreenPopOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
              24x7 Emergency Dispatcher Command Centre
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-500 text-white text-[10px] font-black uppercase glow-secondary animate-pulse">
              LIVE DISPATCH READY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Sub-2s ICE screen pop • Tiered ALS ambulance coordination • Timezone-aware family call tree
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dispatcher/analytics"
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 size={15} className="text-brand-600" />
            <span>SLA Audit Analytics</span>
          </Link>

          <button
            onClick={handleTriggerSimulatedCall}
            className="px-4 py-2 rounded-2xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-black shadow-xs glow-secondary flex items-center gap-1.5 transition-all"
          >
            <PhoneCall size={15} />
            <span>Simulate Inbound Helpline Call</span>
          </button>
        </div>
      </div>

      {/* SLA Countdown Timer Tracker */}
      <SlaCountdownTracker incidentStartTime={new Date()} />

      {/* Main Command Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Incident 360 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Incident Bento Card */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 m-0">
                      Incident #{mockCaller.incidentId}
                    </h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 uppercase">
                      P1 Critical Emergency
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    Caller: {mockCaller.callerPhone} • Menon Residence ({mockCaller.city})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Status</span>
                <span className="text-xs font-black text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-xl block">
                  {incidentState === 'ACTIVE' ? '● Dispatch Active' : '✓ Closed & Logged'}
                </span>
              </div>
            </div>

            {/* Senior Summary Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Patient</span>
                <strong className="text-sm font-black text-slate-900">{mockCaller.primarySenior.name}</strong>
                <span className="text-slate-500 font-bold block">{mockCaller.primarySenior.age}y • Blood Group: {mockCaller.primarySenior.bloodGroup}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Critical Allergies</span>
                <span className="text-secondary-600 font-bold block mt-0.5">
                  ⚠️ {mockCaller.primarySenior.allergies.join(', ')}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Ambulance Status</span>
                <strong className="text-brand-600 font-black block mt-0.5">
                  {dispatchedAmbulanceName}
                </strong>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAmbulanceModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs glow-secondary flex items-center gap-2 transition-all"
              >
                <Ambulance size={15} />
                <span>Tiered Ambulance Dispatch</span>
              </button>

              <button
                onClick={() => setIsPreBriefOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all"
              >
                <FileText size={15} />
                <span>Clinical Hospital Pre-Brief</span>
              </button>

              <button
                onClick={() => setIsClosureModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-2 transition-colors ml-auto"
              >
                <CheckCircle2 size={15} />
                <span>Resolve & Close Incident</span>
              </button>
            </div>
          </div>

          {/* Timezone-Aware Family Call Tree Component */}
          <FamilyEscalationPanel incidentId={mockCaller.incidentId} contacts={mockFamilyContacts} />
        </div>

        {/* Right Col: Hospital & ER Destination Profile */}
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black shadow-xs">
                <Hospital size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">Preferred Trauma ER Desk</h3>
                <p className="text-xs text-slate-500 font-medium m-0">Contracted Hospital Partner</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <strong className="text-sm font-black text-slate-900 block">
                {mockCaller.primarySenior.preferredHospital}
              </strong>
              <p className="text-slate-600 font-medium m-0">
                Old Airport Road, HAL 2nd Stage, Bangalore 560008
              </p>
              <a
                href={`tel:${mockCaller.primarySenior.erPhone}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-brand-600 hover:underline pt-1"
              >
                <PhoneCall size={12} />
                <span>Trauma ER Desk: {mockCaller.primarySenior.erPhone}</span>
              </a>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Attending Physician</span>
              <strong className="text-slate-900 block">{mockCaller.primarySenior.primaryPhysician}</strong>
            </div>
          </div>

          {/* Dispatcher Protocol SLA Standards */}
          <div className="bento-card p-6 space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Emergency Response Protocols
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>CTI Screen Pop in &lt; 2.0 seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Ambulance Booking in &lt; 3.0 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Golden Hour Arrival in &lt; 15 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Sequential NRI Call Tree with 3m Timeout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmergencyScreenPop
        caller={mockCaller}
        isOpen={isScreenPopOpen}
        onAccept={() => setIsScreenPopOpen(false)}
        onDismiss={() => setIsScreenPopOpen(false)}
        onTriggerAmbulance={() => {
          setIsScreenPopOpen(false);
          setIsAmbulanceModalOpen(true);
        }}
      />

      <AmbulanceDispatchModal
        isOpen={isAmbulanceModalOpen}
        seniorName={mockCaller.primarySenior.name}
        address={mockCaller.address}
        onClose={() => setIsAmbulanceModalOpen(false)}
        onDispatched={(fleet) => {
          setDispatchedAmbulanceName(`${fleet.name} (ETA ${fleet.etaMinutes}m)`);
          setIsPreBriefOpen(true);
        }}
      />

      <HospitalPreBriefSheet
        data={mockPreBrief}
        isOpen={isPreBriefOpen}
        onClose={() => setIsPreBriefOpen(false)}
      />

      <IncidentClosureModal
        incidentId={mockCaller.incidentId}
        seniorName={mockCaller.primarySenior.name}
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onClosed={(payload) => {
          setIncidentState('RESOLVED');
        }}
      />
    </div>
  );
}
